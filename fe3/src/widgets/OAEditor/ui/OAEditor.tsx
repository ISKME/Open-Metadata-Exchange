import { useState, useEffect, useRef } from 'react';
import { OATitleForm, OAImageForm, OASection } from 'entities/OAEditor';
import { ILesson, ISection } from 'entities/Lesson';
import { RelatedResource } from 'entities/RelatedResource';
import { BlockUI, buiStyle } from 'shared/ui/BlockUI/BlockUI';
import req from 'shared/lib/req';

const createSectionsMap = (sections) => {
  return sections.reduce((acc, section) => {
    acc[section.step_id] = section;
    return acc;
  }, {});
}

export function OAEditor({ lesson }: { lesson: any }) {
  const [processing, setProcessing] = useState(false);
  const [sections, setSections] = useState(lesson.sections || []);
  const [sectionsMap, setSectionsMap] = useState(createSectionsMap(sections));

  const lessonRef = useRef(lesson);
  const sectionsRef = useRef(sections);
  const sectionsMapRef = useRef(sectionsMap);

  // Create refs to lesson and sections for using them in useEffect function,
  // without it these vars may lose their context in the async function.
  useEffect(() => { lessonRef.current = lesson; }, [lesson]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { sectionsMapRef.current = sectionsMap; }, [sectionsMap]);

  const onLessonChange = (field, value) => {
    lesson[field] = value;
  }

  const onSectionChange = (section: ISection, newSection: ISection, replace = false) => {
    if (replace) {
      delete sectionsMap[section.step_id];
    }
    const newSectionsMap = { ...sectionsMap };
    newSectionsMap[section.step_id] = newSection;
    setSectionsMap(newSectionsMap);
  }

  const onSectionMove = (pos, offset) => {
    const newPos = pos + offset;
    const newSections = [...sections];
    const [movedSection] = newSections.splice(pos, 1);
    newSections.splice(newPos, 0, movedSection);
    setSections(newSections);
  }

  const onSectionDelete = (pos) => {
    const newSections = [...sections];
    const [deleted] = newSections.splice(pos, 1);
    delete sectionsMap[deleted.step_id];

    if (deleted.delete_url) {
      setProcessing(true)
      req.del(deleted.delete_url).then(() => {
        setSections(newSections);
        setProcessing(false);
      })
    } else {
      setSections(newSections);
    }
  }

  const registerSection = (section) => {
    sectionsMap[section.step_id] = section;
    setSections([...sections, section]);
  }

  const addSection = () => {
    registerSection({
      name: '',
      content: '',
      teacher_description: '',
      task_id: crypto.randomUUID(),
      step_id: crypto.randomUUID(),
      is_new: true,
    });
  }

  useEffect(() => {
    document.addEventListener('oa:submit', (e: any) => {
      setProcessing(true);
      const currentLesson = lessonRef.current;
      const currentSections = sectionsRef.current;
      const currentSectionsMap = sectionsMapRef.current;
      const sectionsData = currentSections.reduce((acc, section) => {
        acc.push(currentSectionsMap[section.step_id]);
        return acc;
      }, []);
      req.put(lesson.edit_url, { ...currentLesson, sections: sectionsData }).then((data: ILesson) => {
        setSectionsMap(createSectionsMap(data.sections));
        setProcessing(false);
        setSections(data.sections);
        if (e?.detail?.nextURL) {
          location.href = e.detail.nextURL;
        }
      })
    });
  }, []);

  return (
    <div style={buiStyle.uiBox}>
      {processing && (<BlockUI text='Saving...'/>)}
      <OATitleForm lesson={lesson} onChange={onLessonChange} />
      <OAImageForm lesson={lesson} onChange={onLessonChange} />
      <div className="lesson-editor-task-list">
        {sections.map((section, i) => (
          <OASection key={section.task_id}
                     section={section}
                     number={i + 1}
                     totalNumber={sections.length}
                     onChange={onSectionChange}
                     onSectionMove={onSectionMove}
                     onSectionDelete={onSectionDelete}
                     createURL={lesson.section_create_url}
                     RelatedResourceWidget={RelatedResource}
          />
        ))}
        <button className="btn btn-primary task-list-new-task-btn" type="button" onClick={addSection}>Insert New Section</button>
      </div>
    </div>
  )
}

export function QAEditorAction({ title, event, className, nextURL = null }) {
  const dispatchEvent = (e) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent(event, { detail: { nextURL } }));
  }

  return <button onClick={dispatchEvent} className={className}>{title}</button>;
}
