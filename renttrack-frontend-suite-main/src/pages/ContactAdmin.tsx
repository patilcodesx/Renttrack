import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/renttrack/InputField";
import { useToast } from "@/hooks/use-toast";

export default function ContactAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Administrator will contact you shortly."
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

        <h2 className="text-3xl font-bold">Contact Administrator</h2>
        <p className="text-muted-foreground">
          Need help? Submit your request.
        </p>

        <form className="space-y-6" onSubmit={submit}>
          <InputField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Message"
            id="message"
            textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Send Request
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
