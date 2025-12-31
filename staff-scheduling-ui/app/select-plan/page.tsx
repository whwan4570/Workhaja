"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

type PlanType = "trial" | "basic" | "enterprise"

interface Plan {
  id: PlanType
  title: string
  description: string
  price: string
  priceDescription?: string
}

const plans: Plan[] = [
  {
    id: "trial",
    title: "14-Day Free Trial",
    description: "Max 50 users, unlimited branches",
    price: "Free",
    priceDescription: "for month",
  },
  {
    id: "basic",
    title: "Basic",
    description: "Without limitations",
    price: "$43",
    priceDescription: "/users and month",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "Without limitations",
    price: "Custom",
  },
]

export default function SelectPlanPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("trial")

  const handleContinue = () => {
    // TODO: Handle plan selection and redirect
    router.push("/onboarding")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-4xl">
        <Link
          href="/onboarding"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Select plan</h1>
        <p className="text-muted-foreground mb-8">We will help you with both 5 and 500 users.</p>

        <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanType)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.priceDescription && (
                    <span className="text-sm text-muted-foreground ml-2">{plan.priceDescription}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        <p className="text-sm text-muted-foreground mb-6">
          Prices without VAT. Quantity price when buying more credits.
        </p>

        <Button onClick={handleContinue} className="w-full md:w-auto" size="lg">
          Continue
        </Button>
      </div>
    </div>
  )
}

