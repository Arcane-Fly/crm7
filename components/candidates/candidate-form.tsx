'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const candidateFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Name must not be longer than 30 characters.',
    }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Please enter a valid phone number.',
  }),
  location: z.string().min(1, {
    message: 'Please enter a location.',
  }),
  title: z.string().min(1, {
    message: 'Please enter a job title.',
  }),
  about: z.string().max(500, {
    message: 'Bio must not be longer than 500 characters.',
  }),
  status: z.enum(['active', 'inactive', 'placed', 'interviewing'], {
    required_error: 'Please select a status.',
  }),
  skills: z.string().min(1, {
    message: 'Please enter at least one skill.',
  }),
  availability: z.string().min(1, {
    message: 'Please enter availability.',
  }),
  preferredLocation: z.string().min(1, {
    message: 'Please enter preferred location.',
  }),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().min(1),
  }),
  links: z.object({
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  }),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateFormProps {
  initialData?: Partial<CandidateFormValues>;
  onSubmit: (data: CandidateFormValues) => void;
}

export function CandidateForm({
  initialData,
  onSubmit,
}: CandidateFormProps): JSX.Element {
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      about: '',
      status: 'active',
      skills: '',
      availability: '',
      preferredLocation: '',
      salary: {
        min: 0,
        max: 0,
        currency: 'USD',
      },
      links: {
        linkedin: '',
        github: '',
        portfolio: '',
      },
    },
  });

  function onFormSubmit(data: CandidateFormValues) {
    onSubmit(data);
    toast({
      title: 'Candidate saved',
      description: 'The candidate information has been successfully saved.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.smith@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Location</FormLabel>
                <FormControl>
                  <Input placeholder="New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about the candidate..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description of the candidate's background and expertise.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Input
                  placeholder="React, TypeScript, Node.js"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comma-separated list of skills
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <FormControl>
                  <Input placeholder="Immediately" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Location</FormLabel>
                <FormControl>
                  <Input placeholder="Remote / New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="salary.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="links.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.github"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.portfolio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit">Save Candidate</Button>
        </div>
      </form>
    </Form>
  );
}
