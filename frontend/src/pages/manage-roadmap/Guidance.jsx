import React, { useMemo } from "react";
import { store } from "../../lib";
import { roadmapGuidanceContent } from "../../static";

const Guidance = () => {
  const activeLang = store.useState((s) => s.language?.active);

  const content = useMemo(() => {
    const value = roadmapGuidanceContent();
    return value[activeLang];
  }, [activeLang]);

  return (
    <div id="guidance">
      {content.title}
      {content.content}
    </div>
  );
};

export default Guidance;
