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
  videoUrl: z.string().url({
    message: "Please enter a valid URL for the video source.",
  }),
});

export function MovieForm({ onSubmit }: { onSubmit: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: new Date().getFullYear().toString(),
      description: "",
      videoUrl: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would submit to the backend
    onSubmit();
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
                <Input placeholder="e.g. Inception" {...field} className="bg-background border-border" />
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
                    <SelectTrigger className="bg-background border-border">
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
                  <Input placeholder="2024" {...field} className="bg-background border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stream URL (HLS/MP4)</FormLabel>
              <FormControl>
                <Input placeholder="https://server.com/path/to/video.m3u8" {...field} className="bg-background border-border font-mono text-xs" />
              </FormControl>
              <FormDescription>
                Enter the direct link to the video file hosted on your streaming server.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synopsis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter movie description..." 
                  className="resize-none bg-background border-border" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Add Movie</Button>
      </form>
    </Form>
  );
}
