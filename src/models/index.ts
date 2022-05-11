import { Candidate } from "./candidate";
import { Company } from "./company";
import { Job } from "./job";

Candidate.belongsToMany(Job, {through: 'job_candidates'})

Job.belongsToMany(Candidate, {through: 'job_candidates'})

Company.hasMany(Job)

Job.belongsTo(Company)

export {
    Candidate,
    Company,
    Job
}