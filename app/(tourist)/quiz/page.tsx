'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { OnboardingQuizResponse } from '@/lib/types'
import { ArrowRight, ChevronDown } from 'lucide-react'

type QuizStep = 'interests' | 'budget' | 'groupSize' | 'travelStyle' | 'mobility' | 'results'

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState<QuizStep>('interests')
  const [responses, setResponses] = useState<Partial<OnboardingQuizResponse>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPreferences() {
      try {
        const response = await fetch('/api/preferences', {
          method: 'GET',
          cache: 'no-store',
        })

        if (response.status === 401) {
          return
        }

        if (!response.ok) {
          return
        }

        const result = (await response.json()) as {
          preferences?: OnboardingQuizResponse | null
        }

        if (!cancelled && result.preferences) {
          setResponses(result.preferences)
        }
      } catch {
        return
      }
    }

    void loadPreferences()

    return () => {
      cancelled = true
    }
  }, [])

  const handleNextStep = () => {
    const steps: QuizStep[] = [
      'interests',
      'budget',
      'groupSize',
      'travelStyle',
      'mobility',
      'results',
    ]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const handlePrevStep = () => {
    const steps: QuizStep[] = [
      'interests',
      'budget',
      'groupSize',
      'travelStyle',
      'mobility',
      'results',
    ]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const handleCompleteQuiz = async () => {
    const finalResponses: OnboardingQuizResponse = {
      interests: responses.interests || [],
      budget: responses.budget || 'moderate',
      groupSize: responses.groupSize || 2,
      travelStyle: responses.travelStyle || 'immersive',
      mobility: responses.mobility || 'full',
      previousExperience: responses.previousExperience || false,
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalResponses),
      })

      if (response.status === 401) {
        router.push(`/sign-in?redirectTo=${encodeURIComponent('/quiz')}`)
        return
      }

      router.push('/experiences')
    } finally {
      setIsSaving(false)
    }
  }

  const progress = {
    interests: 20,
    budget: 40,
    groupSize: 60,
    travelStyle: 80,
    mobility: 100,
    results: 100,
  }

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 md:py-20">
          <div className="mb-12">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Find Your Perfect Experience</h2>
              <span className="text-sm text-muted-foreground">{progress[step]}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress[step]}%` }}
              />
            </div>
          </div>

          <div className="space-y-8 rounded-lg border border-border bg-card p-8 md:p-10">
            {step === 'interests' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    What interests you most?
                  </h3>
                  <p className="text-muted-foreground">Select all that apply</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'cultural', label: 'Cultural Traditions & History' },
                    { id: 'culinary', label: 'Food & Cooking' },
                    { id: 'craft', label: 'Arts & Crafts' },
                    { id: 'ritual', label: 'Spiritual & Wellness' },
                    { id: 'community', label: 'Community & Social Impact' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        value={option.id}
                        checked={responses.interests?.includes(option.id as never) || false}
                        onChange={(e) => {
                          const newInterests = responses.interests || []
                          if (e.target.checked) {
                            setResponses({
                              ...responses,
                              interests: [...newInterests, option.id as never],
                            })
                          } else {
                            setResponses({
                              ...responses,
                              interests: newInterests.filter((i) => i !== option.id),
                            })
                          }
                        }}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 'budget' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    What&apos;s your budget per experience?
                  </h3>
                  <p className="text-muted-foreground">Select one option</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'budget',
                      label: 'Budget-Friendly ($0-50)',
                      desc: 'Affordable and accessible experiences',
                    },
                    {
                      id: 'moderate',
                      label: 'Moderate ($50-100)',
                      desc: 'Balanced quality and value',
                    },
                    {
                      id: 'luxury',
                      label: 'Luxury ($100+)',
                      desc: 'Premium and exclusive experiences',
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={option.id}
                        checked={responses.budget === option.id}
                        onChange={(e) =>
                          setResponses({
                            ...responses,
                            budget: e.target.value as OnboardingQuizResponse['budget'],
                          })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 'groupSize' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    Who are you traveling with?
                  </h3>
                  <p className="text-muted-foreground">How many people in your group?</p>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 1, label: 'Solo Traveler' },
                    { value: 2, label: 'Couple or Friends (2 people)' },
                    { value: 4, label: 'Small Group (3-4 people)' },
                    { value: 6, label: 'Family Group (5-6 people)' },
                    { value: 8, label: 'Larger Group (7+ people)' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                    >
                      <input
                        type="radio"
                        name="groupSize"
                        value={option.value}
                        checked={responses.groupSize === option.value}
                        onChange={(e) =>
                          setResponses({
                            ...responses,
                            groupSize: Number.parseInt(e.target.value, 10),
                          })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 'travelStyle' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    What&apos;s your travel style?
                  </h3>
                  <p className="text-muted-foreground">
                    How do you prefer to experience new cultures?
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'immersive',
                      label: 'Immersive & Hands-On',
                      desc: 'Fully participate and learn by doing',
                    },
                    {
                      id: 'observational',
                      label: 'Observational',
                      desc: 'Learn by watching and listening',
                    },
                    {
                      id: 'flexible',
                      label: 'Flexible & Adaptive',
                      desc: 'Mix of both and go with the flow',
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                    >
                      <input
                        type="radio"
                        name="travelStyle"
                        value={option.id}
                        checked={responses.travelStyle === option.id}
                        onChange={(e) =>
                          setResponses({ ...responses, travelStyle: e.target.value })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 'mobility' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    Do you have any mobility considerations?
                  </h3>
                  <p className="text-muted-foreground">
                    Help us find the most suitable experiences
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'full',
                      label: 'Full Mobility',
                      desc: 'No mobility considerations',
                    },
                    {
                      id: 'limited',
                      label: 'Limited Mobility',
                      desc: 'Need wheelchair access or mobility support',
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                    >
                      <input
                        type="radio"
                        name="mobility"
                        value={option.id}
                        checked={responses.mobility === option.id}
                        onChange={(e) =>
                          setResponses({
                            ...responses,
                            mobility: e.target.value as OnboardingQuizResponse['mobility'],
                          })
                        }
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 'results' && (
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">All Set!</h3>
                  <p className="text-muted-foreground">
                    We&apos;ve personalized your experience recommendations.
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/10 p-6">
                  <p className="font-semibold text-foreground">Your preferences:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Interests: {responses.interests?.join(', ')}</li>
                    <li>- Budget: {responses.budget}</li>
                    <li>- Group Size: {responses.groupSize} people</li>
                    <li>- Travel Style: {responses.travelStyle}</li>
                    <li>- Mobility: {responses.mobility}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={step === 'interests'}
              className="min-w-20"
            >
              Back
            </Button>

            {step === 'results' ? (
              <Button
                onClick={handleCompleteQuiz}
                size="lg"
                className="gap-2"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Explore Experiences'} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={
                  step === 'interests' && (!responses.interests || responses.interests.length === 0)
                }
              >
                Next <ChevronDown className="ml-2 h-4 w-4 rotate-90" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
