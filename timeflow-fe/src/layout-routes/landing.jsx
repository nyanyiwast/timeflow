import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Shield, Clock, Users, Zap, CheckCircle, Star, ArrowRight } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute inset-0 digital-rain"></div>
        <div className="scan-line"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>

        {/* Circuit Lines */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-circuit-pulse"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-circuit-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 holographic-text font-mono">TimeFlow</h1>
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-mono">
            NEXT-GEN ATTENDANCE SYSTEM
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 holographic-text font-mono">
            REVOLUTIONIZE
            <br />
            ATTENDANCE TRACKING
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced biometric camera technology meets seamless user experience. Transform your workplace with instant
            check-in/check-out powered by AI recognition.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="tech-glow font-mono text-lg px-8 py-4 bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/login'}>
              <Zap className="mr-2 h-5 w-5" />
              LOGIN
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-mono text-lg px-8 py-4 border-primary/30 hover:bg-primary/10 bg-transparent"
              onClick={() => window.location.href = '/register'}
            >
              <Camera className="mr-2 h-5 w-5" />
              REGISTER
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-mono">99.9%</div>
              <div className="text-sm text-muted-foreground">ACCURACY</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-mono">&lt;2s</div>
              <div className="text-sm text-muted-foreground">CHECK-IN TIME</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-mono">24/7</div>
              <div className="text-sm text-muted-foreground">MONITORING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
              ADVANCED <span className="holographic-text">FEATURES</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology designed for the modern workplace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 tech-glow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 font-mono">BIOMETRIC SCANNING</h3>
                <p className="text-muted-foreground">
                  Advanced facial recognition with real-time verification and anti-spoofing technology
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 tech-glow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 font-mono">SECURE ENCRYPTION</h3>
                <p className="text-muted-foreground">
                  Military-grade encryption ensures your biometric data remains completely secure
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 tech-glow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 font-mono">REAL-TIME ANALYTICS</h3>
                <p className="text-muted-foreground">
                  Instant attendance tracking with comprehensive reporting and insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
                WHY CHOOSE <span className="holographic-text">OUR SYSTEM</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2 font-mono">ELIMINATE TIME THEFT</h3>
                    <p className="text-muted-foreground">
                      Prevent buddy punching and unauthorized access with biometric verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2 font-mono">REDUCE ADMINISTRATIVE COSTS</h3>
                    <p className="text-muted-foreground">
                      Automate attendance tracking and reduce manual processing by 90%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2 font-mono">IMPROVE COMPLIANCE</h3>
                    <p className="text-muted-foreground">
                      Maintain accurate records for labor law compliance and auditing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2 font-mono">ENHANCE SECURITY</h3>
                    <p className="text-muted-foreground">Control facility access with integrated security protocols</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
                <div className="text-center mb-6">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold font-mono">TRUSTED BY 10,000+ COMPANIES</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary font-mono">500K+</div>
                    <div className="text-sm text-muted-foreground">ACTIVE USERS</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary font-mono">99.8%</div>
                    <div className="text-sm text-muted-foreground">UPTIME</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary font-mono">50+</div>
                    <div className="text-sm text-muted-foreground">COUNTRIES</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary font-mono">4.9★</div>
                    <div className="text-sm text-muted-foreground">RATING</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
            READY TO <span className="holographic-text">TRANSFORM</span> YOUR WORKPLACE?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using our advanced attendance system. Get started with TimeFlow today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="tech-glow font-mono text-lg px-8 py-4 bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/login'}>
              <ArrowRight className="mr-2 h-5 w-5" />
              LOGIN
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-mono text-lg px-8 py-4 border-primary/30 hover:bg-primary/10 bg-transparent"
              onClick={() => window.location.href = '/register'}
            >
              GET STARTED
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Secure • Fast Setup • Company Ready
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-primary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 font-mono text-primary">ATTENDANCE.AI</h3>
              <p className="text-sm text-muted-foreground">
                Next-generation biometric attendance system powered by advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-mono">PRODUCT</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-mono">COMPANY</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-mono">RESOURCES</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Blog</li>
                <li>Case Studies</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary/20 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground font-mono">
              © 2025 ATTENDANCE.AI.CELINE. ALL RIGHTS RESERVED. | POWERED BY ADVANCED BIOMETRIC TECHNOLOGY
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
