import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content } = req.body;

    // 入力の簡単なバリデーション
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid content' });
    }

    // データを挿入
    const { data, error } = await supabase
      .from('Articles')
      .insert([{
        title: 'title',
        content: 'content',
        approved: false,
        source: 'source',
        user_id: '3689bc8a-1f4a-4390-b442-eef9ddaa6f25'
      }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Articles saved', data });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
