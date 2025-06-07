import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';

export interface MissionValidationConfig {
    checkDuplicateReference?: boolean;
    validateCoordinates?: boolean;
    validateVehiclePlate?: boolean;
    allowFutureDate?: boolean;
}

export class MissionValidationService {
    static requesterNameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { required: true, message: 'Le nom du demandeur est obligatoire' };
            }

            const value = control.value.trim();
            if (value.length < 3) {
                return {
                    minLenght: {
                        actualLength: value.length,
                        requiredLength: 3,
                        message: 'Le nom du demandeur doit comporter au moins 3 caractères.'
                    }
                };
            }

            if (value.length > 100) {
                return {
                    maxLenght: {
                        actualLenght: value.length,
                        requiredLength: 100,
                        message: 'Le nom du demandeur ne doit pas dépasser 100 caractères.'
                    }
                };
            }

            // Regex pour accepter lettres, espaces, tirets et apostrophes
            const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
            if (!namePattern.test(value)) {
                return {
                    invalidName: {
                        message: 'Le nom du demandeur ne peut contenir que des lettres, des espaces, des apostrophes et des tirets.'
                    }
                };
            }

            return null;
        };
    }

    static requesterPhoneValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { required: true, message: 'Le numéro de téléphone est obligatoire' };
            }

            const value = control.value.replace(/[\s\-.]/g, ''); // Supprimer espaces, tirets, points

            // Formats acceptés :
            // +33123456789, +33 1 23 45 67 89, 0123456789, 01 23 45 67 89
            const phonePatterns = [
                /^\+33[1-9]\d{8}$/, // +33123456789
                /^0[1-9]\d{8}$/ // 0123456789
            ];

            const isValid = phonePatterns.some((pattern) => pattern.test(value));

            if (!isValid) {
                return {
                    phone: {
                        message: 'Format de téléphone invalide. Utilisez le format français (+33 ou 0)'
                    }
                };
            }

            if (value.length < 10 || value.length > 20) {
                return {
                    invalidPhone: {
                        message: 'Le numéro de téléphone doit comporter entre 10 et 20 caractères.'
                    }
                };
            }

            return null;
        };
    }

    static providerReferenceValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { required: true, message: 'La référence fournisseur est obligatoire' };
            }

            const value = control.value.trim();
            if (value.length < 3 || value.length > 30) {
                return {
                    invalidReference: {
                        message: 'La référence fournisseur doit comporter entre 3 et 30 caractères.'
                    }
                };
            }

            const referencePattern = /^[a-zA-Z0-9\s_-]+$/;
            if (!referencePattern.test(value)) {
                return {
                    invalidReferenceFormat: {
                        message: 'La référence fournisseur ne peut contenir que des lettres, des chiffres, des espaces, des tirets et des traits de soulignement.'
                    }
                };
            }

            return null;
        };
    }

    static pickupAddressValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { required: true, message: "L'adresse de récupération est obligatoire" };
            }

            const value = control.value.trim();
            if (value.length < 5 || value.length > 255) {
                return {
                    invalidAddress: {
                        message: "L'adresse de récupération doit comporter entre 5 et 255 caractères."
                    }
                };
            }

            const addressPattern = /^[a-zA-Z0-9\s,.'-]+$/;
            if (!addressPattern.test(value)) {
                return {
                    invalidAddressFormat: {
                        message: "L'adresse de récupération ne peut contenir que des lettres, des chiffres, des espaces, des virgules, des points, des apostrophes et des tirets."
                    }
                };
            }

            return null;
        };
    }

    static destinationAddressValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { required: true, message: "L'adresse de destination est obligatoire" };
            }

            const value = control.value.trim();
            if (value.length < 5 || value.length > 255) {
                return {
                    invalidAddress: {
                        message: "L'adresse de destination doit comporter entre 5 et 255 caractères."
                    }
                };
            }

            const addressPattern = /^[a-zA-Z0-9\s,.'-]+$/;
            if (!addressPattern.test(value)) {
                return {
                    invalidAddressFormat: {
                        message: "L'adresse de destination ne peut contenir que des lettres, des chiffres, des espaces, des virgules, des points, des apostrophes et des tirets."
                    }
                };
            }

            return null;
        };
    }

    static notesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; // Notes are optional
            }

            const value = control.value.trim();
            if (value.length > 255) {
                return {
                    maxLength: {
                        actualLength: value.length,
                        requiredLength: 255,
                        message: 'Les notes ne doivent pas dépasser 255 caractères.'
                    }
                };
            }

            if (value.length < 3) {
                return {
                    minLength: {
                        actualLength: value.length,
                        requiredLength: 3,
                        message: 'Les notes doivent comporter au moins 3 caractères.'
                    }
                };
            }

            return null;
        };
    }

    static missionTypesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || control.value.length === 0) {
                return { required: true, message: 'Les types de mission sont obligatoires.' };
            }

            const value = control.value;
            if (!Array.isArray(value) || value.length === 0) {
                return { invalidTypes: { message: 'Au moins un type de mission doit être sélectionné.' } };
            }

            return null;
        };
    }

    static vehicleMakeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return {
                    required: true,
                    message: 'La marque du véhicule est obligatoire'
                };
            }

            const value = control.value.trim();

            if (value.length < 3 || value.length > 50) {
                return {
                    length: {
                        message: 'La marque doit contenir entre 3 et 50 caractères'
                    }
                };
            }

            // Accepter lettres, espaces et tirets (pour Alfa-Romeo, etc.)
            const makePattern = /^[a-zA-ZÀ-ÿ\s-]+$/;
            if (!makePattern.test(value)) {
                return {
                    pattern: {
                        message: 'La marque ne peut contenir que des lettres, espaces et tirets'
                    }
                };
            }

            return null;
        };
    }

    static vehicleModelValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return {
                    required: true,
                    message: 'Le modèle du véhicule est obligatoire'
                };
            }

            const value = control.value.trim();

            if (value.length < 3 || value.length > 50) {
                return {
                    length: {
                        message: 'Le modèle doit contenir entre 3 et 50 caractères'
                    }
                };
            }

            // Accepter lettres, chiffres, espaces et tirets
            const modelPattern = /^[a-zA-Z0-9À-ÿ\s-]+$/;
            if (!modelPattern.test(value)) {
                return {
                    pattern: {
                        message: 'Le modèle ne peut contenir que des lettres, chiffres, espaces et tirets'
                    }
                };
            }

            return null;
        };
    }

    static vehiclePlateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return {
                    required: true,
                    message: "La plaque d'immatriculation est obligatoire"
                };
            }

            const value = control.value.toUpperCase().replace(/[\s-]/g, '');

            // Formats acceptés :
            // Nouveau format : AB123CD (2 lettres + 3 chiffres + 2 lettres)
            // Ancien format : 123ABC45 (1-4 chiffres + 1-3 lettres + 1-3 chiffres)
            const platePatterns = [
                /^[A-Z]{2}\d{3}[A-Z]{2}$/, // Nouveau format : AB123CD
                /^\d{1,4}[A-Z]{1,3}\d{1,3}$/ // Ancien format : 123ABC45
            ];

            const isValid = platePatterns.some((pattern) => pattern.test(value));

            if (!isValid) {
                return {
                    vehiclePlate: {
                        message: "Format de plaque d'immatriculation invalide (ex: AB-123-CD ou 123 ABC 45)"
                    }
                };
            }

            return null;
        };
    }

    // =====================================================
    // MÉTHODES UTILITAIRES
    // =====================================================
    /**
     * Formate les erreurs de validation pour l'affichage
     */
    formatValidationError(errors: ValidationErrors): string {
        // Priorité aux messages personnalisés
        if (errors['message']) {
            return errors['message'];
        }

        // Gestion des erreurs spécifiques avec messages personnalisés
        const errorKeys = Object.keys(errors);
        const firstErrorKey = errorKeys[0];
        const firstError = errors[firstErrorKey];

        if (firstError && typeof firstError === 'object' && firstError['message']) {
            return firstError['message'];
        }

        // Messages par défaut selon le type d'erreur
        switch (firstErrorKey) {
            case 'required':
                return 'Ce champ est obligatoire';
            case 'minLength':
                return `Minimum ${firstError.requiredLength} caractères requis`;
            case 'maxLength':
                return `Maximum ${firstError.requiredLength} caractères autorisés`;
            case 'pattern':
                return 'Format invalide';
            case 'email':
                return 'Adresse email invalide';
            case 'phone':
                return 'Numéro de téléphone invalide';
            case 'vehiclePlate':
                return "Plaque d'immatriculation invalide";
            case 'referenceExists':
                return 'Cette référence existe déjà';
            case 'invalidPlate':
                return "Plaque d'immatriculation non valide";
            case 'invalidTypes':
                return 'Types de mission invalides';
            case 'invalidPriority':
                return 'Priorité invalide';
            default:
                return 'Valeur invalide';
        }
    }

    /**
     * Vérifie si un champ a une erreur spécifique
     */
    hasFieldError(control: AbstractControl, errorType: string): boolean {
        return !!control?.errors?.[errorType];
    }

    /**
     * Obtient le message d'erreur pour un type spécifique
     */
    getFieldErrorMessage(control: AbstractControl, errorType: string): string | null {
        if (this.hasFieldError(control, errorType)) {
            const error = control.errors![errorType];
            if (typeof error === 'object' && error.message) {
                return error.message;
            }
            return this.formatValidationError({ [errorType]: error });
        }
        return null;
    }

    /**
     * Valide un formulaire de mission complet
     */
    validateMissionForm(formData: any, config: MissionValidationConfig = {}): Observable<ValidationErrors | null> {
        const errors: ValidationErrors = {};

        // Validation synchrone de base
        if (config.validateVehiclePlate && formData.vehiclePlate) {
            const plateError = MissionValidationService.vehiclePlateValidator()({ value: formData.vehiclePlate } as AbstractControl);
            if (plateError) {
                errors['vehiclePlate'] = plateError;
            }
        }

        // Retourner les erreurs synchrones ou null
        return of(Object.keys(errors).length > 0 ? errors : null);
    }

    /**
     * Formate un numéro de téléphone pour l'affichage
     */
    formatPhoneDisplay(phone: string): string {
        if (!phone) return '';

        const cleaned = phone.replace(/[\s\-.]/g, '');

        // Format français : +33 1 23 45 67 89 ou 01 23 45 67 89
        if (cleaned.startsWith('+33')) {
            const withoutCountry = cleaned.substring(3);
            return `+33 ${withoutCountry.charAt(0)} ${withoutCountry.substring(1, 3)} ${withoutCountry.substring(3, 5)} ${withoutCountry.substring(5, 7)} ${withoutCountry.substring(7)}`;
        } else if (cleaned.startsWith('0')) {
            return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
        }

        return phone;
    }

    /**
     * Formate une plaque d'immatriculation
     */
    formatVehiclePlate(plate: string): string {
        if (!plate) return '';

        // Supprimer tous les caractères non-alphanumériques
        const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        // Format nouveau style : AB123CD -> AB-123-CD
        if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(cleaned)) {
            return cleaned.replace(/^([A-Z]{2})(\d{3})([A-Z]{2})$/, '$1-$2-$3');
        }

        // Format ancien style : 123ABC45 -> 123 ABC 45
        const oldStyleRegex = /^(\d{1,4})([A-Z]{1,3})(\d{1,3})$/;
        if (oldStyleRegex.test(cleaned)) {
            const match = oldStyleRegex.exec(cleaned);
            if (match) {
                return `${match[1]} ${match[2]} ${match[3]}`;
            }
        }

        return plate;
    }
}
