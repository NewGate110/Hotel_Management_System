import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-room-image-editor',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="margin-top: 12px; padding: 14px 16px; background: var(--bg-alt); border: 1px solid var(--border); border-radius: var(--r-md);">
      <p style="font-size: 11px; font-weight: 500; color: var(--fg-3); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px; display: flex; align-items: center; gap: 4px;">
        <span class="material-icons-outlined" style="font-size: 13px;">photo_camera</span>
        Room image
      </p>
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <input
          type="url"
          [(ngModel)]="urlInput"
          placeholder="https://images.unsplash.com/…"
          style="flex: 1; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface); color: var(--fg); padding: 7px 10px; font-size: var(--fs-sm); outline: none; min-width: 0;"
          (focus)="$any($event.target).style.borderColor='var(--brand)'"
          (blur)="$any($event.target).style.borderColor='var(--border)'"
        />
        <button
          type="button"
          [disabled]="saving()"
          style="flex-shrink: 0; padding: 7px 14px; background: var(--sand-900); color: var(--sand-50); border: none; border-radius: var(--r-md); font-size: var(--fs-sm); font-weight: 500; cursor: pointer; transition: background var(--dur-fast) var(--ease-out);"
          (click)="save()"
          (mouseenter)="$any($event.currentTarget).style.background='var(--sand-800)'"
          (mouseleave)="$any($event.currentTarget).style.background='var(--sand-900)'"
        >
          {{ saving() ? 'Saving…' : 'Save' }}
        </button>
        @if (urlInput) {
          <button
            type="button"
            style="flex-shrink: 0; padding: 7px 10px; background: none; border: 1px solid var(--border); border-radius: var(--r-md); font-size: var(--fs-sm); color: var(--fg-2); cursor: pointer;"
            title="Clear image"
            (click)="clearImage()"
          >
            <span class="material-icons-outlined" style="font-size: 16px; display: block;">clear</span>
          </button>
        }
      </div>
      @if (urlInput) {
        <div style="margin-top: 10px; height: 80px; border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--border);">
          <img [src]="urlInput" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" (error)="onImgError($event)" />
        </div>
      }
    </div>
  `,
})
export class RoomImageEditorComponent implements OnInit {
  @Input() roomId!: number;
  @Input() currentImageUrl: string | null | undefined = null;
  @Output() imageSaved = new EventEmitter<string | null>();

  private readonly adminApi = inject(AdminApiService);
  private readonly notify   = inject(NotificationService);

  urlInput = '';
  readonly saving = signal(false);

  ngOnInit(): void {
    this.urlInput = this.currentImageUrl ?? '';
  }

  save(): void {
    this.saving.set(true);
    const url = this.urlInput.trim() || null;
    this.adminApi.updateRoomImage(this.roomId, url).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.imageSaved.emit(updated.imageUrl ?? null);
        this.notify.success('Room image updated.');
      },
      error: () => {
        this.saving.set(false);
        this.notify.error('Failed to update room image.');
      },
    });
  }

  clearImage(): void {
    this.urlInput = '';
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
