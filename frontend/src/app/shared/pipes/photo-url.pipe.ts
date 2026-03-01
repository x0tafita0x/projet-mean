import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Converts a relative photo path (as stored in the DB) to a full URL.
 * Falls back to a placeholder image if no path is provided.
 *
 * Usage in templates:
 *   {{ photo | photoUrl }}
 *   [src]="photo | photoUrl"
 *   [src]="photo | photoUrl:'assets/custom-placeholder.png'"
 */
@Pipe({
    name: 'photoUrl',
    standalone: true,
})
export class PhotoUrlPipe implements PipeTransform {
    transform(photo: string | null | undefined, placeholder = 'assets/placeholder.png'): string {
        if (!photo) return placeholder;
        // Already an absolute URL (data: URI from FileReader preview, or external)
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        return `${environment.serverUrl}/${photo}`;
    }
}
