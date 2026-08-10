import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <main className="container">
      <section className="hello">
        <h1>Такой страницы пока нет</h1>
        <p>
          <Link href="/">Вернуться на главную</Link>
        </p>
      </section>
    </main>
  );
}
