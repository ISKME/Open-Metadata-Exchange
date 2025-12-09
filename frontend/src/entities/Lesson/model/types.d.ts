export interface ISection {
  task_id: number | string
  step_id: number | string
  name: string
  number: number
  content: string
  teacher_description: string
  attachment_create_url: string
}

export interface ILesson {
  sections: Array<ISection>
}
