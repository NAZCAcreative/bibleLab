import { redirect } from 'next/navigation'

interface Props {
  params: { bookId: string }
}

export default function BookIndexPage({ params }: Props) {
  redirect(`/bible/${params.bookId}/1`)
}
