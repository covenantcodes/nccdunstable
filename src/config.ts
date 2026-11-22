export const church = {
  name: "New Covenant Church Dunstable",
  shortName: "NCC Dunstable",
  location: "Dunstable, Bedfordshire",
  address: "Formerly Methodist Church, Totternhoe Road, Eaton Bray, Dunstable LU6 2BD",
  phone: "07776302392",
  email: "nccdunstable@gmail.com",
  Sunday: "10:00 AM",
  midweek: "Tuesday Bible Study, 7:00–8:00 PM",
  logo: "/images/ncc-dunstable-logo.png",
  bank: {
    name: "Lloyds Bank",
    accountNumber: "24305160",
    sortCode: "30-92-77",
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
