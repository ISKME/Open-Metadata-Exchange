// @ts-ignore
import { Collapse } from 'widgets/Collapse';
import { Tooltip } from 'components/tooltip';
import { Switch } from 'components/switch';
import cls from './SharedPreferences.module.scss';

interface SubscribedContentProps {
    className?: string;
}

export const SharedPreferences = ({ className }: SubscribedContentProps) => {
  return (
    <div className={cls.updatesData}>
      <div className={cls.callout}>
        <div className={cls.frame}>
          <h1>
            Manage how auto push your
            <br />
            shared content changes
          </h1>
          <p>
            All preferences are initially accepted by default.
            <br />
            <b>Use the toggle to customize update acceptance</b>
          </p>
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
            <div>
              <Switch id={8} />
              <span>Replace Aggregator Links</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
          </div>
        </Collapse>
        <Collapse number={-1} title="Metadata updates">
          <div className={cls.switchList}>
            <div>
              <Switch id={9} />
              <span>License changes</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={10} />
              <span>Keyword updates</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={11} />
              <span>User generated tags added</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={12} />
              <span>Metadata cleanup</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={13} />
              <span>Accessibility update</span>
              <Tooltip text="test">
                <div className={cls.tooltip}>?</div>
              </Tooltip>
            </div>
            <div>
              <Switch id={14} />
              <span>Resource alignments update</span>
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
