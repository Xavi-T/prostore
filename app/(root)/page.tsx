export default async function HomePage() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <div>hellow</div>
}
