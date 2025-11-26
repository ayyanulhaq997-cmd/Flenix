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
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

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
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "completed">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      year: new Date().getFullYear().toString(),
      description: "",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadState("uploading");
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState("completed");
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    if (uploadState !== "completed") {
      alert("Please upload a video file first.");
      return;
    }
    onSubmit({ 
      ...values, 
      year: parseInt(values.year),
      fileName,
      status: "processing",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
        <div className="space-y-4">
          <FormLabel>Video Source File</FormLabel>
          
          {uploadState === "idle" && (
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                accept="video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</h3>
              <p className="text-xs text-muted-foreground">MP4, MKV, or MOV (Max 10GB)</p>
            </div>
          )}

          {uploadState === "uploading" && (
            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileVideo className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{fileName}</p>
                    <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setUploadState("idle")}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}

          {uploadState === "completed" && (
            <div className="border border-green-500/20 rounded-xl p-4 bg-green-500/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{fileName}</p>
                    <p className="text-xs text-green-500">Upload Complete</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs hover:text-white text-muted-foreground" onClick={() => setUploadState("idle")}>
                  Change File
                </Button>
            </div>
          )}
        </div>

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

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white h-11"
          disabled={uploadState !== "completed"}
        >
          {uploadState === "uploading" ? "Uploading File..." : "Add Movie to Library"}
        </Button>
      </form>
    </Form>
  );
}