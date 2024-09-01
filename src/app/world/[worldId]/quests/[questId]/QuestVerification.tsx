'use client';

import {DialogDescription} from '@components/ui/Dialog';

type Node = {
  Id: string;
  Type: string;
  Title: string;
  MainStory: boolean | null;
  ConnectsTo: string[];
};

type Quest = {
  Title: string;
  Node: Node[];
};

type QuestVerificationProps = {
  quest: Quest;
};

const QuestVerification = ({quest}: QuestVerificationProps) => {
  const errors: string[] = [];

  quest.Node.forEach(node => {
    if (node.Type === 'unknown') {
      errors.push(`Node ma typ 'unknown'.`);
    }
  });

  const connectedNodes = new Set<string>();

  quest.Node.forEach(node => {
    if (node.ConnectsTo.length > 0) {
      connectedNodes.add(node.Id);
      node.ConnectsTo.forEach(targetId => connectedNodes.add(targetId));
    }
  });

  quest.Node.forEach(node => {
    if (!connectedNodes.has(node.Id)) {
      errors.push(`Node nie jest połączony z żadnym innym node.`);
    }
  });

  quest.Node.forEach(node => {
    if (
      ['death', 'success', 'defeat'].includes(node.Type) &&
      node.ConnectsTo.length > 0
    ) {
      errors.push(`Node typu ${node.Type} ma połączenia wychodzące.`);
    }
  });

  quest.Node.forEach(node => {
    if (
      ['generic_production', 'custom_production', 'other_quest'].includes(
        node.Type,
      ) &&
      !node.Title
    ) {
      errors.push(`Node typu ${node.Type} nie ma wpisanego Title.`);
    }
  });

  quest.Node.forEach(node => {
    if (node.MainStory === null || node.MainStory === undefined) {
      errors.push(`Node nie ma przypisanej wartości dla MainStory.`);
    }
  });

  if (errors.length > 0) {
    return (
      <DialogDescription>
        {'Błędy w weryfikacji:'}
        <ul>
          {errors.map((error, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index}>{error}</li>
          ))}
        </ul>
      </DialogDescription>
    );
  }

  return (
    <DialogDescription>
      {'Zweryfikowano, misja jest zgodna z formatem.'}
    </DialogDescription>
  );
};

export default QuestVerification;
