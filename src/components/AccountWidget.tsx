import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AccountWidget() {
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Hello, Łukasz!
        </CardTitle>
        <CardDescription>
          Your account information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div>
            <strong>You generated</strong> 10 flashcards
          </div>
          <div>
            <strong>Total: </strong> 10 flashcards
          </div>
          <div>
            <strong>Last login: </strong> 10 days ago
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
