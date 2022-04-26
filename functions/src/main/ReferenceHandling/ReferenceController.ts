import {ProfileRepository} from "../repository/ProfileRepository";
import {FlatProfileConverter} from "../converters/FlatProfileConverter";
import {Profile} from "../data-model/Profile";
import {UserProfileConverter} from "../converters/UserProfileConverter";


/**
 * Reference Converter resolves profile id references to Profile Jsons
 * @Input resolving_repository: Repository which should be used to resolve the references
 * **/
export class ReferenceController {

    private resolvingRepository;

    constructor(resolving_repository: ProfileRepository) {
        this.resolvingRepository = resolving_repository;
    }

    /**
     * Resolves a array of referenced profiles.
     * The found references are converted into a profile json which is pushed to a result array.
     * And the unresolved references are pushed to a separate array.
     * Both are returned in a Reference Resolution Object
     * @Input reference_id: reference which should be resolved
     * @Output: ReferenceResolution
     */
    async resolveSingleProfileReference(reference_id: string): Promise<ReferenceResolution> {
        // Initialize vars
        let unresolved_references: string[] = [];
        let resolved_reference: any;
        let result: any = {};

        // Check if reference is empty
        if (reference_id == "") {
            return new ReferenceResolution({}, []);
        }

        // Get referenced Profile from db
        const db_entry = await this.resolvingRepository.getProfileById(reference_id);

        // If the referenced profile exists convert it to a Profile Entity
        if (db_entry) {
            if(reference_id.split("#")[0] == "flt") {
                resolved_reference = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson();
            } else {
                resolved_reference = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();
            }
            result.resolved_reference.profileId = resolved_reference;
        } else {
            // If the referenced profile does not exist write an empty dict into the field and mark the reference as unresolved
            unresolved_references.push(reference_id)
        }
        return new ReferenceResolution(result, unresolved_references);
    }

    /**
     * Resolves a array of referenced profiles.
     * The found references are converted into a profile json which is pushed to a result array.
     * And the unresolved references are pushed to a separate array.
     * Both are returned in a Reference Resolution Object
     * @Input reference_id_list: List of references to resolve.
     * @Output: ReferenceResolution
     */
    async resolveProfileReferenceList(reference_id_list: string[]): Promise<ReferenceResolution> {
        // Initialize vars
        let profile_list: any = {};
        let temp_resolved_reference: Profile;
        let unresolved_references: string[] = [];
        let db_entry;

        // Loop over the reference list and add every found profile to a solution array and mark each unresolved reference as unresolved
        for (let key in reference_id_list) {
            db_entry = await this.resolvingRepository.getProfileById(reference_id_list[key]);
            if (db_entry) {
                if(reference_id_list[key].split("#")[0] == "flt") {
                    temp_resolved_reference = FlatProfileConverter.convertDBEntryToProfile(db_entry);
                } else {
                    temp_resolved_reference = UserProfileConverter.convertDBEntryToProfile(db_entry);
                }
                profile_list.temp_resolved_refrence.profileId = temp_resolved_reference.toJson();
            } else {
                unresolved_references.push(reference_id_list[key])
            }
        }
        // Update field and return Resolution of the field
        return new ReferenceResolution(profile_list, unresolved_references);
    }

    /**
     * This method can be used to delete outdated references after the resolving
     * @Input profile_id: Profile Id of the profile which references should be cleaned
     * @Input field: Field in which the references that should be cleaned are stored
     * @Input current_references: Array of the current references
     * @Input outdated_references: References that should be removed
    **/
    cleanUpReferencesList(profile_id: string, field: string, current_references: string[], outdated_references: string[]): Promise<string> {
        const updated_reference_list = current_references.filter(reference => outdated_references.indexOf(reference))
        let update: any = {}
        update[field] = updated_reference_list;
        return this.resolvingRepository.updateProfile(update, profile_id)
            .then(() => {return "Successfully removed outdated references"})
            .catch((e) => {
                return "Could not update References of profile " + profile_id + " due to: " + e.message;
            });
    }
}


export class ReferenceResolution {
    result: any;
    unresolvedReferences: string[];

    constructor(result: any, unresolved_references: string[]) {
        this.result = result;
        this.unresolvedReferences = unresolved_references;
    }


}

