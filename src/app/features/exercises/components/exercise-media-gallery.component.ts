import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExerciseMedia } from '../interfaces/exercise-media';

interface VideoItem {
  media: ExerciseMedia;
  embed: SafeResourceUrl | null;
}

@Component({
  selector: 'app-exercise-media-gallery',
  template: `
    @if (images().length) {
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (image of images(); track image.id) {
          <img
            [src]="image.url"
            alt="Imagen del ejercicio"
            class="h-48 w-full rounded-lg border border-border object-cover"
          />
        }
      </div>
    }

    @for (video of videos(); track video.media.id) {
      @if (video.embed) {
        <iframe
          class="aspect-video w-full rounded-lg border border-border"
          [src]="video.embed"
          title="Video del ejercicio"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      } @else {
        <a
          [href]="video.media.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary"
        >
          Ver video
        </a>
      }
    }

    @for (link of links(); track link.id) {
      <a
        [href]="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm break-all text-accent-600 hover:underline"
      >
        {{ link.url }}
      </a>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseMediaGallery {
  private readonly sanitizer = inject(DomSanitizer);

  media = input<ExerciseMedia[]>([]);

  protected images = computed(() => this.media().filter((item) => item.type === 'image'));
  protected links = computed(() => this.media().filter((item) => item.type === 'link'));
  protected videos = computed<VideoItem[]>(() =>
    this.media()
      .filter((item) => item.type === 'video')
      .map((media) => ({ media, embed: this.embedUrl(media.url) })),
  );

  // YouTube/Vimeo become an embed URL; anything else is shown as a plain link.
  private embedUrl(url: string): SafeResourceUrl | null {
    try {
      const parsed = new URL(url);
      const id = this.videoId(parsed);

      if (!id) {
        return null;
      }

      const embed = parsed.hostname.endsWith('vimeo.com')
        ? `https://player.vimeo.com/video/${id}`
        : `https://www.youtube.com/embed/${id}`;

      return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    } catch {
      return null;
    }
  }

  private videoId(parsed: URL): string | null {
    if (parsed.hostname.endsWith('youtube.com')) {
      return parsed.searchParams.get('v');
    }

    if (parsed.hostname.endsWith('youtu.be') || parsed.hostname.endsWith('vimeo.com')) {
      const id = parsed.pathname.slice(1);

      return id && !id.includes('/') ? id : null;
    }

    return null;
  }
}
