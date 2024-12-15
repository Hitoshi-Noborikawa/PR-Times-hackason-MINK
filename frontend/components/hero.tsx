import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center mt-10">
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto text-center">
        PR-TIMESへの記事を{" "}
        <label
          className="font-bold hover:underline"
        >
          自動生成
        </label>{" "}
        →{" "}
        <label
          className="font-bold hover:underline"
        >
         確認 
        </label>
        →{" "}
        <label
          className="font-bold hover:underline"
        >
         編集 
        </label>
        が可能
      </p>
      <p className="text-lg text-center max-w-lg">
        PR-TIMESへの記事を自動生成し、編集するためのツールです。
      </p>
    </div>
  );
}
