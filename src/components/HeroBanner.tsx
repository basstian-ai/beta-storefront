import Image from 'next/image';
import type { HeroContent } from '../types';

export default function HeroBanner({ title, description, ctaText, ctaLink, imageUrl, imageAlt = "Hero image" }: HeroContent) {
  return (
    <section className="bg-secondary text-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {title}
            </h1>
            <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-600">
              {description}
            </p>
            <div className="mt-8">
              <a
                href={ctaLink}
                className="inline-block bg-accent text-secondary font-bold py-3 px-8 rounded-md hover:bg-accent-dark transition-colors duration-300"
              >
                {ctaText}
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={imageAlt || "Hero image"}
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
                sizes="(max-width:768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NkYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
