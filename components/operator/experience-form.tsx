'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Experience, ExperienceCategory, ExperienceUpsertInput } from '@/lib/types'
import { useToast } from '@/context/toast-context'

interface ExperienceFormProps {
  mode: 'create' | 'edit'
  initialExperience?: Experience
}

const categories: ExperienceCategory[] = [
  'cultural',
  'culinary',
  'craft',
  'ritual',
  'community',
]

function toCommaSeparated(values: string[]) {
  return values.join(', ')
}

export function ExperienceForm({ mode, initialExperience }: ExperienceFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(initialExperience?.title ?? '')
  const [category, setCategory] = useState<ExperienceCategory>(
    initialExperience?.category ?? 'cultural'
  )
  const [description, setDescription] = useState(initialExperience?.description ?? '')
  const [shortDescription, setShortDescription] = useState(
    initialExperience?.shortDescription ?? ''
  )
  const [image, setImage] = useState(initialExperience?.image ?? '/placeholder.jpg')
  const [price, setPrice] = useState(String(initialExperience?.price ?? 75))
  const [duration, setDuration] = useState(String(initialExperience?.duration ?? 3))
  const [groupMin, setGroupMin] = useState(String(initialExperience?.groupSize.min ?? 1))
  const [groupMax, setGroupMax] = useState(String(initialExperience?.groupSize.max ?? 8))
  const [city, setCity] = useState(initialExperience?.location.city ?? '')
  const [region, setRegion] = useState(initialExperience?.location.region ?? '')
  const [highlights, setHighlights] = useState(
    toCommaSeparated(initialExperience?.highlights ?? [])
  )
  const [includes, setIncludes] = useState(
    toCommaSeparated(initialExperience?.inclusionsAndExclusions.includes ?? [])
  )
  const [excludes, setExcludes] = useState(
    toCommaSeparated(initialExperience?.inclusionsAndExclusions.excludes ?? [])
  )
  const [status, setStatus] = useState(initialExperience?.status ?? 'draft')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const payload: ExperienceUpsertInput = {
      title,
      category,
      description,
      shortDescription,
      image,
      price: Number(price),
      currency: 'USD',
      duration: Number(duration),
      groupSize: {
        min: Number(groupMin),
        max: Number(groupMax),
      },
      location: {
        city,
        region,
        coordinates: [0, 0],
      },
      highlights: highlights
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      includes: includes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      excludes: excludes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      status,
    }

    try {
      const endpoint =
        mode === 'create'
          ? '/api/operator/experiences'
          : `/api/operator/experiences/${initialExperience?.id}`
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save experience')
      }

      addToast(
        mode === 'create' ? 'Experience created successfully.' : 'Experience updated successfully.',
        'success'
      )
      router.push('/operator/experiences')
      router.refresh()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to save experience.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExperienceCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Submission Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Experience['status'])}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending-review">Submit for Review</SelectItem>
                <SelectItem value="archived">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="short-description">Short Description</Label>
            <Textarea
              id="short-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Hero Image URL</Label>
            <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input id="duration" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-min">Minimum Group Size</Label>
            <Input id="group-min" type="number" min="1" value={groupMin} onChange={(e) => setGroupMin(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-max">Maximum Group Size</Label>
            <Input id="group-max" type="number" min="1" value={groupMax} onChange={(e) => setGroupMax(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="highlights">Highlights</Label>
            <Textarea
              id="highlights"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Separate each highlight with a comma"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="includes">What&apos;s Included</Label>
            <Textarea
              id="includes"
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              placeholder="Comma-separated"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excludes">What&apos;s Excluded</Label>
            <Textarea
              id="excludes"
              value={excludes}
              onChange={(e) => setExcludes(e.target.value)}
              placeholder="Comma-separated"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/operator/experiences')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Experience'
                : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
