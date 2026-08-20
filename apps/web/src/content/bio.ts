/**
 * Maxwell AU biography.
 *
 * Source: the official biography supplied by the ministry
 * (docs/content/Maxwell_AU_Biography.pdf). The copy below is drawn from that
 * document — nothing has been added to it. In Phase 3 this moves into the
 * `ArtistProfile` table and becomes editable in the admin CMS.
 */
import type { ArtistProfile } from "@/modules/profile/types";

export const artistProfile: ArtistProfile = {
  name: "Maxwell AU",
  role: "Singer-Songwriter · Recording Artist · Worship Minister",
  tagline: "Worship • Encounter • Transformation",
  summary:
    "Maxwell AU is a singer-songwriter, recording artist and worship minister whose heart is to create an atmosphere where people can encounter the presence of God.",
  summaryAwaitingOwnerContent: false,
  portraitImageSlug: "piano-portrait-02",
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      paragraphs: [
        "Maxwell AU is a singer-songwriter, recording artist, worship minister and songwriter whose heart is to create an atmosphere where people can encounter the presence of God.",
        "With a distinctive sound that blends contemporary Christian worship with the richness, rhythm and expression of African music, Maxwell AU is part of a generation of worshippers passionate about carrying the message of Jesus Christ through music. His ministry goes beyond performance; his desire is to lead people into genuine encounters with God through worship, prayer and the ministry of the Holy Spirit.",
      ],
      imageSlug: "piano-portrait-01",
      awaitingOwnerContent: false,
    },
    {
      id: "ministry-vision",
      heading: "Ministry Vision",
      paragraphs: [
        "At the heart of Maxwell AU's ministry is a clear vision: to see lives transformed and people drawn back to the Heavenly Father.",
        "Through worship and the Word of God, he desires to see both the churched and unchurched experience the love of God, restoration, healing, hope, freedom and joy.",
      ],
      imageSlug: null,
      awaitingOwnerContent: false,
    },
    {
      id: "the-journey",
      heading: "The Journey",
      paragraphs: [
        "Maxwell was born into the family of Bishop John and Peace Aruakpor and raised in Warri, Delta State, Nigeria, in a home grounded in discipline and the fear of God.",
        "His journey of service in the house of God began at just eight years old, when he started playing the drums. His love for music continued to grow, eventually leading him to the keyboard and, ultimately, into worship ministry.",
        "Over the years, Maxwell has served in various parishes of The Redeemed Christian Church of God (RCCG) across Nigeria, Malaysia and Canada. In 2009 he relocated to Malaysia to further his education in Computer Science before moving to Canada in 2011, where he currently resides.",
        "Today, he serves at RCCG Throne of Grace in Windsor, Ontario, Canada, as a praise and worship minister.",
      ],
      imageSlug: "live-band-bw",
      awaitingOwnerContent: false,
    },
    {
      id: "music-and-ministry",
      heading: "Music & Ministry",
      paragraphs: [
        "In 2010, Maxwell AU released his first single, “Jesu We O’ Vie”, featuring Prince Micah, marking the beginning of his journey as a recording artist.",
        "In 2012, he founded Victorious Worshippers, a worship ministry created to bring worshippers together and lead people into deeper encounters with God.",
        "In September 2014, Maxwell released his debut album, Dependable God. The album featured “Hallelujah”, recorded with Faith Eze and Victorious Worshippers. “Hallelujah” received significant recognition, including the Akademia Music Award for Best Gospel/Ballad Song, and received nominations connected with the GMA/Covenant Awards and the Glass Achievement Awards.",
        "On 21 May 2021, Maxwell AU released his second album, Shelter, continuing his message of faith, worship, hope and complete dependence on God.",
      ],
      imageSlug: "piano-portrait-03",
      awaitingOwnerContent: false,
    },
    {
      id: "kings-time",
      heading: "King's Time",
      paragraphs: [
        "In 2025, Maxwell AU launched King's Time, a monthly worship and prayer experience created to provide a dedicated moment for people to step away from the distractions of everyday life and spend intentional time in the presence of God.",
        "King's Time reflects the heartbeat of Maxwell AU's ministry: worship that leads to encounter, prayer that produces transformation, and an atmosphere where Jesus remains the centre.",
      ],
      imageSlug: "kings-time-01",
      awaitingOwnerContent: false,
    },
    {
      id: "ministry-influence",
      heading: "Ministry Influence",
      paragraphs: [
        "Throughout his journey, Maxwell has drawn inspiration from worship leaders and ministers including Donnie McClurkin, Sonnie Badu, Chris Tomlin, Bethel Music, Don Moen, Uche Agu and the late Sammie Okposo.",
        "He has also had the privilege of sharing ministry platforms with internationally recognised gospel ministers and artists including Donnie McClurkin, Wale Adenuga, Tye Tribbett, Travis Greene, Todd Dulaney, William McDowell and Uche Agu.",
        "Yet beyond platforms, awards and music releases, Maxwell AU's greatest desire remains simple: to point people to Jesus. His prayer is that every song, worship experience and ministry assignment becomes an opportunity for someone to encounter God, rediscover hope, experience restoration and grow in intimacy with the Father.",
      ],
      imageSlug: "team-group-01",
      awaitingOwnerContent: false,
    },
    {
      id: "family",
      heading: "Family",
      paragraphs: [
        "Maxwell is married to Linda, who shares his passion for worship and ministry. Together, they are blessed with their children, EloOgheneZino and Oghenefejiro.",
        "For Maxwell AU, ministry begins with a life surrendered to God and extends into his family, the local church, and every opportunity God provides to carry the sound of worship to the nations.",
      ],
      imageSlug: null,
      awaitingOwnerContent: false,
    },
  ],
};

/** The closing line of the official biography, used as a standalone pull-quote. */
export const bioClosingLine =
  "Leading hearts into the presence of God and pointing a generation back to Jesus.";
