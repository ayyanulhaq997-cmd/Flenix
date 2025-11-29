import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileVideo, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  genre: z.string({
    required_error: "Please select a genre.",
  }),
  year: z.string().regex(/^\d{4}$/, {
    message: "Year must be a 4-digit number.",
  }),
  description: z.string().optional(),
  posterUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export function MovieForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: new Date().getFullYear().toString(),
      description: "",
      posterUrl: "",
      videoUrl: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({ 
      ...values, 
      year: parseInt(values.year),
      status: "active",
      duration: 120,
      requiredPlan: "free",
      rating: "PG-13",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movie Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Inception" {...field} className="bg-black/20 border-white/10" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
                    <SelectItem value="scifi">Sci-Fi</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Year</FormLabel>
                <FormControl>
                  <Input placeholder="2024" {...field} className="bg-black/20 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synopsis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter movie description..." 
                  className="resize-none bg-black/20 border-white/10 min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="posterUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poster Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/poster.jpg" 
                  {...field} 
                  className="bg-black/20 border-white/10" 
                />
              </FormControl>
              <FormDescription className="text-xs">URL to the movie poster image (JPG/PNG)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://bucket.wasabisys.com/movies/video.mp4" 
                  {...field} 
                  className="bg-black/20 border-white/10" 
                />
              </FormControl>
              <FormDescription className="text-xs">Full URL to your video file on Wasabi/S3 (MP4/MKV/MOV)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white h-11"
        >
          Add Movie to Library
        </Button>
      </form>
    </Form>
  );
}