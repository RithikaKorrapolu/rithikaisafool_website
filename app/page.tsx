import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F2' }}>
      <Image
        src="/fulllogo_black.png"
        alt="Logo"
        width={500}
        height={200}
        priority
      />
    </main>
  );
}
