import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarIcon } from "@/components/icons";

export default function NextVisitPromptPage() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="" backHref="/analysis/disclaimer" />

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Card className="w-full">
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
              <CalendarIcon className="h-6 w-6 text-brand-600" />
            </span>
            <h1 className="text-base font-bold text-foreground">병원에 다녀오셨나요?</h1>
            <p className="text-sm leading-relaxed text-muted">
              진료 후 진단명과 처방 내용을 기록해 두면, 이 시점을 기준으로 경과 변화를
              &ldquo;처방 후 호전/악화&rdquo;로 더 정확하게 표시해 드릴 수 있어요.
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-2 px-6 pb-6">
        <Link href="/medical/diagnosis">
          <Button fullWidth size="lg">
            진단·처방 입력하기
          </Button>
        </Link>
        <Link href="/">
          <Button fullWidth size="lg" variant="ghost">
            나중에 하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
