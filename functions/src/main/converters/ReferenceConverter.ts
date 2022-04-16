import {ProfileQueryRepository} from "../repository/ProfileQueryRepository";
import {FlatProfileConverter} from "./FlatProfileConverter";
import {Profile} from "../data-model/Profile";
import {UserProfileConverter} from "./UserProfileConverter";


/**
 * Reference Converter resolves profile id references to Profile Jsons
 * @Input resolving_repository: Repository which should be used to resolve the references
 * **/
// Todo: Reference cleanup: delete references that were not found
export class ReferenceConverter {

    private resolvingRepository;

    constructor(resolving_repository: ProfileQueryRepository) {
        this.resolvingRepository = resolving_repository;
    }

    /**
     * Resolves a field that references a Profile.
     * If the reference could be found in the Repository it writes the found profile json into the field,
     * else it writes an empty json into it
     * @Input profile_json: The json of the profile which contains the field that should be resolved
     * @Input field_to_resolve: The field which contains a profile reference which should be resolved
     * @Output: Resolution
     */
    async resolveSingleProfileReference(reference_id: string): Promise<Resolution> {
        // Initialize vars
        let unresolved_references: string[] = [];
        let resolved_reference: any;

        // Check if reference is empty
        if (reference_id == "") {
            return new Resolution({}, []);
        }

        // Get referenced Profile from db
        const db_entry = await this.resolvingRepository.getProfileById(reference_id);

        // If the referenced profile exists convert it to a Profile Entity
        if (db_entry._fieldsProto) {
            if(reference_id.split("#")[0] == "flt") {
                resolved_reference = FlatProfileConverter.convertDBEntryToProfile(db_entry).toJson();
            } else {
                resolved_reference = UserProfileConverter.convertDBEntryToProfile(db_entry).toJson();
            }
        } else {
            // If the referenced profile does not exist write an empty dict into the field and mark the reference as unresolved
            resolved_reference = {};
            unresolved_references.push(reference_id)
        }
        return new Resolution(resolved_reference, unresolved_references);
    }

    /**
     * Resolves a field that has a list of referenced profiles.
     * The found references are converted into a profile json and pushed to an array which will then replace the reference array of the field
     * @Input profile_json: The json of the profile which contains the field that should be resolved
     * @Input field_to_resolve: The field which contains a profile reference which should be resolved
     * @Output: Resolution
     */
    async resolveProfileReferenceList(reference_id_list: string[]): Promise<Resolution> {
        // Initialize vars
        let profile_list: string[] = [];
        let temp_resolved_reference: Profile;
        let unresolved_references: string[] = [];
        let db_entry;

        // Loop over the reference list and add every found profile to a solution array and mark each unresolved reference as unresolved
        for (let reference_id in reference_id_list) {
            db_entry =await this.resolvingRepository.getProfileById(reference_id);
            if (db_entry._fieldsProto) {
                if(reference_id.split("#")[0] == "flt") {
                    temp_resolved_reference = FlatProfileConverter.convertDBEntryToProfile(db_entry);
                } else {
                    temp_resolved_reference = UserProfileConverter.convertDBEntryToProfile(db_entry);
                }
                profile_list.push(temp_resolved_reference.toJson());
            } else {
                unresolved_references.push(reference_id)
            }
        }
        // Update field and return Resolution of the field
        return new Resolution(profile_list, unresolved_references);
    }
}


export class Resolution {
    result: any;
    unresolvedReferences: string[];

    constructor(result: any, unresolved_references: string[]) {
        this.result = result;
        this.unresolvedReferences = unresolved_references;
    }


}

