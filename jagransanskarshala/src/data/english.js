// src/data/english.js
// English content for the site. Add new keys here as you build each section.
// Keep the SAME shape/keys in hindi.js so switching languages never breaks.

const english = {
  meta: {
    langCode: "en",
    langLabel: "English",
  },

  navbar: {
    links: [
      { id: "hero", label: "About Sanskarshala" },
      { id: "this-year", label: "This Year's Talk" },
      { id: "till-now", label: "Talks So Far" },
      { id: "contact", label: "Contact Us" },
      {
        id: "archive",
        label: "Archive",
        dropdown: [
          {
            id: "archive-2020",
            label: "Sanskriti Se Sanskar (2020)",
            link: "/gallery?year=2020",
          },
          {
            id: "archive-2021",
            label: "Desh Se Hum Aur Humse Desh Banta Hai (2021)",
            link: "/gallery?year=2021",
          },
          {
            id: "archive-2022",
            label: "Digital Sanskar (2022)",
            link: "/gallery?year=2022",
          },
          {
            id: "archive-2023",
            label: "Urja Saksharta (2023)",
            link: "/gallery?year=2023",
            subDropdown2023: [
              {
                id: "urja-2023-1",
                label: "Urja Ke Sanskar",
                link: "/gallery?year=2023",
              },
              {
                id: "urja-2023-2",
                label: "Calculate Your Carbon Footprint",
                link: "https://energy.jagransanskarshala.com/",
              },
            ],
          },
          {
            id: "archive-2024",
            label: "Sanskarshala 2024",
            link: "/gallery?year=2024",
          },
          {
            id: "archive-2025",
            label: "Sanskarshala 2025",
            link: "/gallery?year=2025",
            subDropdown: [{ id: "gallery-2025", label: "Gallery", link: "/gallery?year=2025" }],
          },
        ],
      },
    ],
  },

  hero: {
    title: "Talking About\nOur ",
    highlight: "Digital\n",
    suffix: "Conduct",
    primaryBtn: "Read This Year's Talk",
    secondaryBtn: "Know About Sanskarshala",
  },

  about: {
    headingMain: "About",
    headingHighlight: "Sanskarshala",
    paragraph:
      "For over a decade, Jagran Sanskarshala has been empowering young minds with the values, skills, and vision needed to build a stronger tomorrow. Launched in 2010, the initiative proudly enters its 17th edition, continuing its mission of shaping responsible, confident, and future-ready youth. As an extension of Dainik Jagran's enduring commitment to nation-building, Jagran Sanskarshala goes beyond journalism to create meaningful social impact through active community engagement. Rooted in Jagran's ethos, the program inspires teenagers and young citizens to become compassionate leaders and responsible change-makers. By nurturing character, encouraging social responsibility, and fostering civic values, Jagran Sanskarshala is not just preparing the next generation for success—it is empowering them to build a better, stronger, and more inclusive India.",
    highlight: "",
    button: "Learn More",
  },

  about2026: {
    headingMain: "This Year's",
    headingHighlight: "Talk",
    paragraph:
      'Today\'s adolescents are the first generation of true digital natives, where digital is no longer an external tool but an integral part of everyday life. However, the challenges of the infinite digital world extend far beyond those of the physical world. To help young minds understand these challenges and explore practical, rational solutions, the theme of Sanskarshala 2026 is "Digital Consciousness." Through stories, articles, and discussions, Sanskarshala will encourage adolescents to reflect on how digital behaviours influence their attention, relationships, family bonding, conversations, reading habits, self-reflection, and overall well-being.',
  },

  yearTalk: {
    headingMain: "Talks",
    headingHighlight: "So Far",
  },

  weeklyTalk: {
    headingMain: "This Week's",
    headingHighlight: "Talk",
    week: "Week 1",
    title: "Attention",
    body: "Earlier it felt like...\nAttention used to drift away.\nNow it feels like...\nIt stays a little bit, everywhere.",
    buttons: {
      viewAd: "View the Ad",
      readArticle: "Read the Article",
      whatDoYouThink: "What Do You Think?",
    },
  },

  surveyCTA: {
    badge: "Share Your Voice",
    headingMain: "Take the Sanskarshala",
    headingHighlight: "2026 Survey",
    description:
      "Your perspective matters! Take a quick 2-minute survey to help us empower young minds and build a stronger, value-driven future together.",
    button: "Take Survey Now",
    buttonLink: "#survey",
  },

  contactUs: {
    headingMain: "We'd Love to",
    headingHighlight: "Hear From You!",
    subheading:
      "Have a question, suggestion or need support? Reach out to us and we'll get back to you as soon as possible.",

    form: {
      title: "Send us a Message",
      subtitle: "Fill out the form below and our team will get back to you.",
      nameLabel: "Your Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      subjectLabel: "Subject",
      subjectPlaceholder: "Select a subject",
      subjectOptions: [
        "General Inquiry",
        "Feedback",
        "Support",
        "Partnership",
        "Other",
      ],
      messageLabel: "Your Message",
      messagePlaceholder: "Type your message here...",
      submitBtn: "Send Message",

      // Shown after successful submission
      thankYouTitle: "Thank You!",
      thankYouMessage:
        "Your message has been received. Our team will get back to you as soon as possible.",
      sendAnotherBtn: "Send Another Message",
    },

    getInTouch: {
      title: "Get in Touch",
      subtitle: "We're here to help and answer any question you may have.",
      items: [
        {
          icon: "email",
          label: "Email",
          value: "info@jagransanskarsala.com",
          note: "We reply within 24 hours",
        },
        {
          icon: "address",
          label: "Address",
          value: "Dainik Jagran, 50, Okhla Phase -3,\nNew Delhi – 110020",
          note: "",
        },
      ],
    },
  },

  languageSwitcher: {
    title: "Select Language",
    ariaLabel: "Translate this page",
  },

  footer: {
    tagline: "For a Prosperous Society and a Strong Nation",
    rights: "Jagran Sanskarshala. All Rights Reserved.",
    email: "info@jagransanskarsala.com",
  },

  welcomePopup: {
    heading: "Welcome to Jagran Sanskarshala",
    description:
      "Join us in exploring digital consciousness and making a positive impact in the digital world.",
    button: "Get Started",
  },

  survey: {
    buttonText: "Survey",
    title: "Form Survey",
    nameLabel: "Your Name",
    namePlaceholder: "Enter your name",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email",
    subjectLabel: "Subject",
    subjectPlaceholder: "Select a subject",
    subjectOptions: [
      "Select a subject",
      "General Inquiry",
      "Feedback",
      "Support",
      "Partnership",
      "Other",
    ],
    messageLabel: "Your Message",
    messagePlaceholder: "Type your message here...",
    submitBtn: "Send Message",
    thankYouTitle: "Thank You!",
    thankYouMessage:
      "Your message has been received. Our team will get back to you as soon as possible.",
    closeBtn: "Close",
  },
};

export default english;
