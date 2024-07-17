import SingleSelect from '@/components/SingleSelect';
import { memo, useMemo } from 'react';
import {
  SelectLabel,
  VersionContainer,
  VersionSelectContainer
} from "@/components/StyledInputEnhancer.jsx";

export const buildVersionOption = () => ({ name, id = {} }) => {
  return {
    label: name,
    value: id,
  }
}

const VersionSelect = memo(function VersionSelect({ currentVersionName = '', versions = [], onSelectVersion, enableVersionListAvatar = false }) {
  const currentVersion = useMemo(() => versions.find(item => item.name === currentVersionName)?.id, [currentVersionName, versions]);
  const versionSelectOptions = useMemo(() => {
    return versions.map(buildVersionOption(enableVersionListAvatar));
  }, [enableVersionListAvatar, versions]);

  return (
    <>
      <VersionContainer>
        <SelectLabel variant="bodyMedium">Version</SelectLabel>
      </VersionContainer>
      <VersionSelectContainer>
        <SingleSelect
          onValueChange={onSelectVersion}
          value={currentVersion}
          options={versionSelectOptions}
          // enableVersionListAvatar={enableVersionListAvatar}
          showOptionIcon
          inputSX={{
            '& .MuiSelect-select': {
              paddingRight: '8px !important',
            },
          }}
        />
      </VersionSelectContainer>
    </>
  );
});

export default VersionSelect;