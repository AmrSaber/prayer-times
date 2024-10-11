export async function GET() {
  return new Response('OK', { headers: { 'content-type': 'text/plain' } });
}
