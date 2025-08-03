import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Secure Your Email Communications
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed font-mono">
              We encrypt emails before storing them, but our servers receive them in plaintext first. Metadata like sender, recipient, and timestamps remain visible. Blanc can't solve email's fundamental privacy issues, but we're transparent about limitations and don't sell your data.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-mono hover:bg-primary/90 transition-colors">
                Create Account
              </button>
              <button className="border border-border px-8 py-3 rounded-lg font-mono hover:bg-muted transition-colors">
                blanc on GitHub
              </button>
            </div>
          </div>
          <div className="order-first md:order-last">
            <Image
              src="/hero.png"
              alt="Blanc encrypted email interface"
              width={1000}
              height={800}
              className="shadow-lg w-full h-auto"
              priority
            />
          </div>
        </div>
      </main>
      
      <section>
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-3 font-mono">No data collection</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                We don't collect personal data on sign-up. No email verification required. Payment via cryptocurrency accepted.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 font-mono">Honest about limitations</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                We receive emails in plaintext before encryption. Metadata remains visible. We can't promise true anonymity.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 font-mono">Open source</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                All code is open source for transparency. You can audit our encryption implementation and security practices.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 font-mono">No tracking or ads</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                No analytics, no behavioral tracking, no advertising. Our business model is subscription-only.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 font-mono">Minimal logs</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                We log only essential server operations. No content logging, no user behavior tracking, no data mining.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 font-mono">Privacy focused</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Built by privacy advocates who understand email's limitations and are honest about what we can actually protect.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
