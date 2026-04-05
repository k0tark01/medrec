"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Globe, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  const invalidLink = !userId || !secret;
  const [status, setStatus] = useState<"loading" | "success" | "error">(invalidLink ? "error" : "loading");
  const [errorMsg, setErrorMsg] = useState(invalidLink ? "Invalid verification link." : "");

  useEffect(() => {
    if (invalidLink) return;
    const uid = userId;
    const sec = secret;
    if (!uid || !sec) return;

    async function verify() {
      try {
        await account.updateVerification(uid, sec);
        await refreshUser();
        setStatus("success");
        setTimeout(() => router.replace("/dashboard"), 1200);
      } catch (err: unknown) {
        setStatus("error");
        setErrorMsg(getAuthErrorMessage(err, t));
      }
    }

    verify();
  }, [invalidLink, userId, secret, router, refreshUser, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">Job Bridge</span>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-semibold text-foreground mb-2">{t.emailVerification.checking}</h2>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">{t.emailVerification.verified}</h2>
                <p className="text-sm text-muted-foreground mb-4">Redirecting to dashboard...</p>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Verification Failed</h2>
                <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
                <Link href="/auth">
                  <Button>Back to Sign In</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
