export const church = {
  name: "New Covenant Church Dunstable",
  shortName: "NCC Dunstable",
  location: "Dunstable, Bedfordshire",
  address:
    "New Covenant Church, Totternhoe Road, Eaton Bray, Dunstable LU6 2BD",
  phone: "07776302392",
  email: "nccdunstable@gmail.com",
  Sunday: "10:00 AM",
  midweek: "Tuesday Bible Study, 7:00–8:00 PM",
  logo: "/images/ncc-dunstable-logo.png",
  bank: {
    name: "Metro Bank",
    accountNumber: "46924738",
    sortCode: "23-05-80",
    purpose: "",
    suggestion: "",
  },
  socials: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/nccdunstable_?srtk=MXh0c3Eyd3podGg0Zg%3D%3D&utm_source=qr",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/19ePi3Z5x4/?mibextid=wwXIfr",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@nccdunstable3542?si=9FbsbCUyTWYd6SaS",
    },
  ],
};

export const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Sermons", "/sermons"],
  ["Events", "/events"],
  // ["Ministries", "/ministries"],
  ["Contact", "/contact"],
  ["Give", "/give"],
] as const;
