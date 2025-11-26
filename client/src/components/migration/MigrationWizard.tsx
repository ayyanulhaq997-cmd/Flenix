import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Server, ArrowRight, Database, AlertTriangle, CheckCircle, Filter, FolderX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MigrationWizard() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);

  const startMigration = () => {
    setIsMigrating(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMigrating(false);
          setStep(4);
          return 100;
        }
        return prev + 1; // Slow progress
      });
    }, 100);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-primary" />
          Server Migration Assistant
        </CardTitle>
        <CardDescription>
          Transfer content from Legacy (Crack) Server to Fenix Production.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-white/10 rounded-lg bg-black/20 text-center">
                  <div className="mb-2 flex justify-center"><Server className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="text-sm font-medium text-white">Source</h3>
                  <p className="text-xs text-muted-foreground">Legacy Server (Crack)</p>
                  <div className="mt-2 text-xs text-green-500 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                  <div className="mb-2 flex justify-center relative"><Server className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-sm font-medium text-white relative">Destination</h3>
                  <p className="text-xs text-muted-foreground relative">Fenix Production</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Source Server Credentials</Label>
                <Input placeholder="Server IP / Hostname" defaultValue="192.168.1.XXX (Auto-detected)" className="bg-black/20 border-white/10" disabled />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Content Selection
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox id="movies" defaultChecked className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="movies"
                        className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Movies Library
                      </label>
                      <p className="text-xs text-muted-foreground">
                        2,845 files • 4.2 TB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox id="series" defaultChecked className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="series"
                        className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        TV Series
                      </label>
                      <p className="text-xs text-muted-foreground">
                        432 shows • 1.8 TB
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-2">
                      <FolderX className="w-4 h-4" /> Exclusion Rules
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="ex-1" />
                        <Label htmlFor="ex-1" className="text-xs">Exclude corrupted/incomplete files</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="ex-2" />
                        <Label htmlFor="ex-2" className="text-xs">Exclude temp/cache directories</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="ex-3" defaultChecked />
                        <Label htmlFor="ex-3" className="text-xs">Exclude logs and metadata older than 30 days</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 py-4"
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-white">{progress}%</div>
                <p className="text-muted-foreground text-sm">Transferring data...</p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current File:</span>
                  <span className="text-white font-mono">/movies/action/dune_part_two_4k.mkv</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Transfer Rate:</span>
                  <span className="text-white">450 MB/s</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Migration Complete</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                All selected content has been successfully transferred to the Fenix Production server.
              </p>
              <div className="p-3 bg-white/5 rounded-lg text-xs text-left w-full max-w-sm border border-white/10">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Total Files:</span>
                  <span className="text-white">12,403</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Total Size:</span>
                  <span className="text-white">6.1 TB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="text-green-500">0</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/5 pt-6">
        {step < 3 && (
          <Button 
            variant="ghost" 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
            className="text-muted-foreground hover:text-white"
          >
            Back
          </Button>
        )}
        
        {step === 1 && (
          <Button onClick={() => setStep(2)} className="bg-primary hover:bg-primary/90 ml-auto">
            Connect & Scan
          </Button>
        )}

        {step === 2 && (
          <Button onClick={() => setStep(3)} className="bg-primary hover:bg-primary/90 ml-auto">
            Confirm & Start Transfer
          </Button>
        )}

        {step === 3 && !isMigrating && (
          <Button onClick={startMigration} className="bg-primary hover:bg-primary/90 ml-auto">
            Begin Transfer
          </Button>
        )}

        {step === 4 && (
          <Button onClick={() => setStep(1)} className="ml-auto" variant="outline">
            Close Assistant
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}