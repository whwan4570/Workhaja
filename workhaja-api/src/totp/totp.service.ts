import { Injectable, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TOTP Service for generating and validating QR codes for check-in/check-out
 */
@Injectable()
export class TotpService {
  constructor(private readonly prisma: PrismaService) {
    // Configure TOTP settings
    authenticator.options = {
      step: 30, // Token valid for 30 seconds
      window: [1, 0], // Allow 1 time step backward (for clock skew)
    };
  }

  /**
   * Generate or retrieve TOTP secret for a store
   * @param storeId - Store ID
   * @returns TOTP secret
   */
  async getOrGenerateSecret(storeId: string): Promise<string> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { totpSecret: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // If secret exists, return it
    if (store.totpSecret) {
      return store.totpSecret;
    }

    // Generate new secret
    const secret = authenticator.generateSecret();
    
    // Save to database
    await this.prisma.store.update({
      where: { id: storeId },
      data: { totpSecret: secret },
    });

    return secret;
  }

  /**
   * Generate a TOTP token for a store
   * @param storeId - Store ID
   * @returns TOTP token (6-digit code)
   */
  async generateToken(storeId: string): Promise<string> {
    const secret = await this.getOrGenerateSecret(storeId);
    return authenticator.generate(secret);
  }

  /**
   * Validate a TOTP token for a store
   * @param storeId - Store ID
   * @param token - TOTP token to validate
   * @returns true if token is valid
   */
  async validateToken(storeId: string, token: string): Promise<boolean> {
    const secret = await this.getOrGenerateSecret(storeId);
    return authenticator.verify({ token, secret });
  }

  /**
   * Generate QR code data URL for a store
   * The QR code contains a URL that can be scanned to get the TOTP token
   * Format: workhaja://checkin/{storeId}?token={currentToken}
   * @param storeId - Store ID
   * @param storeName - Store name (for display in QR code)
   * @returns QR code as data URL (base64 image)
   */
  async generateQRCode(storeId: string, storeName: string): Promise<string> {
    const secret = await this.getOrGenerateSecret(storeId);
    
    // Create otpauth URL (standard format for TOTP)
    // This allows apps like Google Authenticator to add it
    // For our use case, we'll use a custom URL format that our app understands
    const serviceName = 'Workhaja';
    const accountName = storeName;
    const otpauthUrl = authenticator.keyuri(accountName, serviceName, secret);

    // Generate QR code as data URL
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR code with custom format containing store ID and current token
   * This is an alternative format that includes the current token in the QR code
   * Format: workhaja://checkin/{storeId}/{token}
   * @param storeId - Store ID
   * @param storeName - Store name (for display)
   * @returns QR code as data URL and current token
   */
  async generateQRCodeWithToken(
    storeId: string,
    storeName: string,
  ): Promise<{ qrCodeDataUrl: string; token: string; expiresAt: Date }> {
    const token = await this.generateToken(storeId);
    
    // Custom URL format: workhaja://checkin/{storeId}/{token}
    const customUrl = `workhaja://checkin/${storeId}/${token}`;

    // Generate QR code as data URL
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(customUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      // Token expires in 30 seconds (TOTP window)
      const expiresAt = new Date(Date.now() + 30 * 1000);

      return { qrCodeDataUrl, token, expiresAt };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Reset TOTP secret for a store (generates a new one)
   * @param storeId - Store ID
   * @returns New TOTP secret
   */
  async resetSecret(storeId: string): Promise<string> {
    const newSecret = authenticator.generateSecret();
    
    await this.prisma.store.update({
      where: { id: storeId },
      data: { totpSecret: newSecret },
    });

    return newSecret;
  }
}
