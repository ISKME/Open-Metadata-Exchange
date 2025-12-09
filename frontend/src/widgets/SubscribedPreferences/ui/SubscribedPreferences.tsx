// @ts-ignore
import { Collapse } from 'widgets/Collapse';
import * as MetadataDropdown from 'widgets/Metadata/Dropdown';
import * as MetadataCollapse from 'widgets/Metadata/Collapse';
import { Tooltip } from 'components/tooltip';
import { Switch } from 'components/switch';
import cls from './SubscribedPreferences.module.scss';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SubscribedContentProps {
    className?: string;
}

const compute = (obj) => Object.values(obj).filter((item) => item === null).length;

export const SubscribedPreferences = ({ className }: SubscribedContentProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sections, setSections] = useState([]);
  const [changes, setChanges] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    const tenant = searchParams.get('tenant')
    const url = tenant ? `/api/imls/v2/metadata/mapping/${tenant}` : '/api/imls/v2/metadata/mapping'
    axios.get(url).then(({ data }) => {
      const { sections } = data;
      const changes = {};
      const stats = {};
      setSections(sections);
      for (const item of sections) {
        Object.keys(item.mapping).forEach((key) => {
          if (!changes[item.name]) changes[item.name] = {};
          if (item.mapping[key].length > 0) {
            changes[item.name][key] = item.mapping[key][0];
          } else {
            changes[item.name][key] = null;
          }
        });
      }
      for (const key in changes) {
        stats[key] = compute(changes[key]);
      }
      setChanges(changes);
      setStats(stats);
      if (window.location.hash === '#meta') {
        document.getElementById('meta').scrollIntoView();
      }
    });
  }, []);

  function save(slug, data) {
    axios.post('/api/imls/v2/metadata/mapping', {
      [slug]: data.reduce((ac, a) => ({ ...ac, [a[0]]: a[1] }), {})
    }).then(console.log).catch(console.log);
  }

  return (
    <div className={cls.updatesData}>
      <div className={cls.callout}>
        <div className={cls.frame}>
          <h1>
            Auto accept resource metadata
            <br />
            updates on your subscribed content
          </h1>
          <p>
            All preferences are initially accepted by default.
            <br />
            <b style={{ textDecoration: 'underline' }}>Use the toggle to customize update acceptance</b>
          </p>
        </div>
      </div>
      <div id="meta" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className={cls.empty}>
        <h3>Map your Metadata Standards</h3>
        <p>Select your preferred metadata to map for each metadata item.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((section) => (
          <MetadataCollapse.Collapse number={stats[section.name]} title={section.name}>
            <div className={cls['preferences-values']}>
              <div className={cls['section-content']}>
                <div className={cls['frame']}><div className={cls['text-wrapper']}>New Unmapped Values</div></div>
                <div className={cls['div']}>
                  <div className={cls['frame-2']}>
                    <div className={cls['div-wrapper']}><div className={cls['text-wrapper-2']}>OER Exchange {section.name}</div></div>
                    <div className={cls['frame-wrapper']}>
                      <div className={cls['frame-3']}><div className={cls['text-wrapper-2']}>Your {section.name}</div></div>
                    </div>
                    {/* <div className={cls['frame-4']}>
                      <div className={cls['microsite']}>Also use as keyword</div>
                      <div className={cls['frame-5']}>
                        <div className={cls['microsite-2']}>Select All</div>
                        <div className={cls['microsite-2']}>Clear All</div>
                      </div>
                    </div> */}
                  </div>
                  <div className={cls['frame-6']}>
                    {Object.entries(section.mapping).map((item) => (
                      <div className={cls['frame-2']}>
                        <div className={cls['frame-7']}>
                          <div className={cls['frame-8']}>
                            <div className={cls['text-wrapper-3']}>{item[0]}</div>
                          </div>
                        </div>
                        <div className={cls['frame-wrapper']}>
                          <MetadataDropdown.Dropdown
                            keyword={section.name}
                            list={section.metadata}
                            initial={item[1][0]}
                            onSelect={(selected) => {
                              const temp = changes;
                              temp[section.name][item[0]] = selected;
                              setChanges(temp);
                              const stats = {};
                              for (const key in changes) {
                                stats[key] = compute(changes[key]);
                              }
                              setChanges(changes);
                              setStats(stats);
                            }}
                          />
                        </div>
                        {/* <div className={cls['property-unchecked-wrapper']}>
                          <div className={cls['property-unchecked']}><div className={cls['rectangle']}></div></div>
                        </div> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className={cls['button']}
                style={{
                  border: '2px solid #1E1E1E',
                  background: '#054DD1',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  save(section.slug, Object.entries(changes[section.name]).filter((item) => item[1]));
                  if (stats[section.name] === 0) setStats({ ...stats, [section.name]: -1 })
                }}
              >
                <div className={cls['label-text']}>Save and Update Map</div>
              </button>
            </div>
          </MetadataCollapse.Collapse>
        ))}
        </div>
      </div>
      <div>
        <a href="#">Expand All Preferences</a>
      </div>
      <div className={cls.gridCollapses}>
        <Collapse number={-1} title="Content Engagement updates">
          <div className={cls.switchList}>
            <div>
              <Switch id={1} />
              <span>Comments added</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={2} />
              <span>Reviews added</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
        <Collapse number={-1} title="Deccessioned updates">
          <div className={cls.switchList}>
            <div>
              <Switch id={3} />
              <span>Copyright</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={4} />
              <span>Out of Date</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={5} />
              <span>Inappropriate / Spam</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
        <Collapse number={-1} title="URL updates">
          <div className={cls.switchList}>
            <div>
              <Switch id={6} />
              <span>Replacing Broken URLs</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={7} />
              <span>URL redirect updates</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
        <Collapse number={-1} title="Version updates">
          <div className={cls.switchList}>
            <div>
              <Switch id={8} />
              <span>New resource version</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={9} />
              <span>Remixes</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
        <Collapse number={-1} title="Metadata updates" className={cls.fullSpan}>
          <div className={cls.switchList}>
            <div>
              <Switch id={10} />
              <span>User generated tags added</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={11} />
              <span>Metadata cleanup</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={12} />
              <span>Accessibility update</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
};
