import { clickOnEnterOrSpace } from './clickOnEnterOrSpace';

const keyEvent = (key: string, onTarget = true) => {
  const element = { click: jest.fn() };
  const event = {
    key,
    target: onTarget ? element : {},
    currentTarget: element,
    preventDefault: jest.fn(),
  };
  return { element, event };
};

describe('clickOnEnterOrSpace', () => {
  test('Enter and Space click the element', () => {
    ['Enter', ' '].forEach((key) => {
      const { element, event } = keyEvent(key);
      clickOnEnterOrSpace(event as any);
      expect(element.click).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });
  });

  test('other keys do nothing', () => {
    const { element, event } = keyEvent('a');
    clickOnEnterOrSpace(event as any);
    expect(element.click).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  test('keys typed in a child element are left alone', () => {
    const { element, event } = keyEvent(' ', false);
    clickOnEnterOrSpace(event as any);
    expect(element.click).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
