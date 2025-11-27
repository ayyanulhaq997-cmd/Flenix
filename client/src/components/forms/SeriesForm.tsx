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
import { Upload, X, FileVideo, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  genre: z.string({
    required_error: "Please select a genre.",
  }),
  seasons: z.string().regex(/^\d+$/, {
    message: "Must be a number.",
  }),
  description: z.string().optional(),
});

export function SeriesForm({ onSubmit }: { onSubmit: () => void }) {
  const [episodes, setEpisodes] = useState<{ name: string; file: string; status: "idle" | "uploading" | "completed" }[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      seasons: "1",
      description: "",
    },
  });

  const addEpisode = () => {
    setEpisodes([...episodes, { name: `Episode ${episodes.length + 1}`, file: "", status: "idle" }]);
  };

  const removeEpisode = (index: number) => {
    const newEpisodes = [...episodes];
    newEpisodes.splice(index, 1);
    setEpisodes(newEpisodes);
  };

  const handleFileUpload = (index: number) => {
    const newEpisodes = [...episodes];
    newEpisodes[index].status = "uploading";
    setEpisodes(newEpisodes);

    // Simulate upload
    setTimeout(() => {
      const completedEpisodes = [...episodes];
      completedEpisodes[index].status = "completed";
      completedEpisodes[index].file = "uploaded_video.mkv";
      setEpisodes(completedEpisodes);
    }, 1500);
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log({ ...values, episodes });
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
              <FormLabel>Series Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Stranger Things" {...field} className="bg-black/20 border-white/10" />
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
            name="seasons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Seasons</FormLabel>
                <FormControl>
                  <Input placeholder="1" {...field} className="bg-black/20 border-white/10" />
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
                  placeholder="Enter series description..." 
                  className="resize-none bg-black/20 border-white/10 min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Episodes Upload</label>
            <Button type="button" variant="outline" size="sm" onClick={addEpisode} className="h-8 border-white/10 hover:bg-white/5">
              <Plus className="w-3 h-3 mr-1" /> Add Episode
            </Button>
          </div>
          
          <div className="space-y-2">
            {episodes.map((ep, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Input 
                      value={ep.name} 
                      onChange={(e) => {
                        const newEpisodes = [...episodes];
                        newEpisodes[index].name = e.target.value;
                        setEpisodes(newEpisodes);
                      }}
                      className="h-8 w-32 bg-black/20 border-white/10"
                    />
                    
                    {ep.status === "idle" && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => handleFileUpload(index)}
                      >
                        <Upload className="w-3 h-3 mr-2" /> Upload Video
                      </Button>
                    )}
                    
                    {ep.status === "uploading" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        Uploading...
                      </div>
                    )}
                    
                    {ep.status === "completed" && (
                      <div className="flex items-center gap-2 text-xs text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEpisode(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {episodes.length === 0 && (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-lg text-muted-foreground text-xs">
                No episodes added. Click "Add Episode" to start uploading content.
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white h-11"
        >
          Create Series
        </Button>
      </form>
    </Form>
  );
}