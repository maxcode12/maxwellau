export type BioSection = {
  readonly id: string;
  readonly heading: string;
  /** Each entry renders as a paragraph. */
  readonly paragraphs: readonly string[];
  readonly imageSlug: string | null;
  /**
   * True while the section still holds placeholder copy rather than the
   * owner's own words. The page renders these with a visible notice so nothing
   * placeholder is ever mistaken for the real biography.
   */
  readonly awaitingOwnerContent: boolean;
};

export type ArtistProfile = {
  readonly name: string;
  readonly role: string;
  readonly tagline: string;
  /** One or two sentences used for meta descriptions and the bio hero. */
  readonly summary: string;
  readonly summaryAwaitingOwnerContent: boolean;
  readonly portraitImageSlug: string | null;
  readonly sections: readonly BioSection[];
};
