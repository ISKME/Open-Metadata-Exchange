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
  edit_next_url?: string | null
  sections: Array<ISection>
  is_content_use_permission_accepted?: boolean
  is_resource_accessibility_accepted?: boolean
}
