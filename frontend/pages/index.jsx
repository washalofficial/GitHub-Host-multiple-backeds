import Link from 'next/link';
export default function Home(){
  return (
    <div style={{maxWidth:900, margin:'40px auto', fontFamily:'Inter, sans-serif'}}>
      <h1>Auto Deploy Tool</h1>
      <p>One-click deploy your GitHub repo to serverless platforms. Beginner-friendly.</p>
      <Link href="/deploy"><a>Start Deploy →</a></Link>
    </div>
  )
}
