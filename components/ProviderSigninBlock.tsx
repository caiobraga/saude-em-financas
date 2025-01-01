import { FaGoogle, FaGithub } from "react-icons/fa";
import { signInWithGoogle } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
export default function ProviderSigninBlock() {
    const isGoogleEnabled = process.env.GOOGLE_OAUTH_CLIENT_ID ? true : false
    const isGithubEnabled = process.env.GITHUB_OAUTH_CLIENT_ID ? true : false
    return (
        <>
            <div className="flex flex-row gap-2">
                {isGoogleEnabled && (
                    <form action={signInWithGoogle} className="basis-full">
                        <Button variant="outline" aria-label="Sign in with Google" type="submit" className="w-full">
                            <FaGoogle />
                        </Button>
                    </form>
                )}
            </div>
        </>
    )
}