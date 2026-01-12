import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/renttrack/InputField";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
    }

    toast({
      title: "Password Updated",
      description: "You can now log in with your new password.",
      icon: <CheckCircle className="w-5 h-5" />
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter and confirm your new password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            label="New Password"
            id="newPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <InputField
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Update Password
            <Lock className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
