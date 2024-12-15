import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Articleの型
type Article = {
  id: number
  title: string
  content: string
  approved: boolean
  created_at: string
  updated_at: string
}

type ArticleListProps = {
  articles: Article[]
}

// Article一覧のモックデータ
const mockArticles: Article[] = [
  {
    id: 1,
    title: "記事1",
    content: "記事1の内容",
    approved: true,
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: 2,
    title: "記事2",
    content: "記事2の内容",
    approved: true,
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: 3,
    title: "記事3",
    content: "記事3の内容",
    approved: false,
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
]

// メインページ
const HomePage = async () => {
    const supabase = await createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect("/sign-in");
    }

    // Article一覧のデータを取得
    const articles: Article[] = mockArticles

    return (
      <div className="w-full">
        <Table className="w-full">
          <TableCaption>A list of your recent articles.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Article</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.approved ? "Approved" : "Pending"}</TableCell>
                <TableCell>{article.created_at}</TableCell>
                <TableCell>{article.updated_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  export default HomePage