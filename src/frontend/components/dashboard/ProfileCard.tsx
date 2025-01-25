import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileCardProps {
  profile: {
    email?: string;
    username?: string;
    github_username?: string;
  } | null;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Username:</strong> {profile?.username}</p>
          {profile?.github_username && (
            <p><strong>GitHub:</strong> {profile.github_username}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};