import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

export function EmployeeSettingsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle>Tùy chọn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tùy chọn cho tài khoản nhân công sẽ được bổ sung trong phiên bản tiếp theo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
