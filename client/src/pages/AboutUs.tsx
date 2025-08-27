import React from "react";
import {
  Target,
  Eye,
  Lightbulb,
  Award,
  Users,
  Globe,
  Rocket,
  Heart,
  Shield,
  GraduationCap,
  Sparkles,
  Users2,
} from "lucide-react";

const teamMembers = [
  {
    name: "Jane Doe",
    role: "Lead Trainer",
    bio: "Jane brings over 10 years of experience in digital education and curriculum development.",
    image: "/team/jane.jpg",
    expertise: ["Curriculum Design", "Digital Learning", "Student Success"],
  },
  {
    name: "John Smith",
    role: "Project Manager",
    bio: "John specializes in project delivery and team leadership, ensuring smooth operations.",
    image: "/team/john.jpg",
    expertise: [
      "Project Management",
      "Team Leadership",
      "Process Optimization",
    ],
  },
];

const stats = [
  { number: "10K+", label: "Students Enrolled", icon: GraduationCap },
  { number: "500+", label: "Courses Available", icon: Sparkles },
  { number: "95%", label: "Success Rate", icon: Award },
  { number: "24/7", label: "Support Available", icon: Users },
];

const coreValues = [
  {
    name: "Excellence",
    icon: Award,
    description: "Striving for the highest quality in everything we do",
  },
  {
    name: "Innovation",
    icon: Lightbulb,
    description: "Embracing new ideas and cutting-edge technology",
  },
  {
    name: "Integrity",
    icon: Shield,
    description: "Building trust through honest and ethical practices",
  },
  {
    name: "Collaboration",
    icon: Users2,
    description: "Working together to achieve shared goals",
  },
  {
    name: "Inclusivity",
    icon: Globe,
    description: "Creating opportunities for everyone to succeed",
  },
];

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary/80">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium">
                <Rocket className="mr-2 h-4 w-4" />
                Transforming Education Since 2020
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Empowering <span className="text-yellow-300">Learning</span> for
                Everyone
              </h1>

              <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                We're on a mission to democratize education by providing
                accessible, high-quality learning experiences that transform
                lives and careers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn btn-lg bg-white text-primary hover:bg-gray-100 font-semibold">
                  Explore Our Courses
                </button>
                <button className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  Watch Our Story
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/team/hero-edu.svg"
                  alt="About Us"
                  className="w-full max-w-lg mx-auto drop-shadow-2xl animate-float"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Objectives */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on strong principles and clear objectives, we're committed
              to creating meaningful educational experiences that last a
              lifetime.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-soft hover-lift border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To deliver transformative educational experiences that inspire
                growth, innovation, and lifelong learning for all individuals,
                regardless of their background or circumstances.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-soft hover-lift border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 text-purple-600 mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's leading platform for accessible,
                high-quality digital education, empowering millions to achieve
                their full potential and create positive change in their
                communities.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-soft hover-lift border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 text-green-600 mb-6">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Objectives
              </h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Provide accessible and affordable learning opportunities
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Foster a supportive and inclusive learning environment
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Continuously innovate our courses and teaching methods
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Support professional and personal development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape the culture that
              makes our platform unique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {coreValues.map((value, idx) => {
              const IconComponent = value.icon;
              return (
                <div key={idx} className="group">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 text-center hover-lift border border-gray-100 h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-soft text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {value.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate educators and professionals dedicated to your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl shadow-soft hover-lift border border-gray-100 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-primary/10 shadow-soft"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(member.name) +
                          "&background=random&size=80")
                      }
                    />
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-primary font-semibold">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Expertise:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIdx) => (
                        <span
                          key={skillIdx}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
            <Heart className="mr-2 h-4 w-4" />
            Our Journey
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            Our Story
          </h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20">
            <p className="text-lg lg:text-xl text-white/90 leading-relaxed mb-8">
              Founded by passionate educators and technologists, our journey
              began with a shared vision to make quality education accessible to
              everyone. What started as a small team of dedicated professionals
              has grown into a dynamic community committed to continuous
              improvement and community impact.
            </p>

            <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
              Today, we continue to push boundaries, embrace innovation, and
              create learning experiences that not only educate but inspire and
              transform lives.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have transformed their careers and
            lives through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-lg bg-primary text-white hover:bg-primary/90 font-semibold">
              Get Started Today
            </button>
            <button className="btn btn-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
