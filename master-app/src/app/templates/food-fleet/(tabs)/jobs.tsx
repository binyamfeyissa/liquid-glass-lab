import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { useFleet } from "../state";
import { JobRow, ListCard, RowSeparator, Screen, SectionTitle, T } from "../ui";

export default function JobsScreen() {
  const fleet = useFleet();
  const active = fleet.activeJob;
  const finished = fleet.jobs;

  return (
    <Screen title="Jobs" subtitle="Everything on today's shift">
      {active ? (
        <View>
          <SectionTitle>In progress</SectionTitle>
          <ListCard>
            <JobRow job={active} onPress={() => router.push("/templates/food-fleet/active")} />
          </ListCard>
        </View>
      ) : null}

      <View>
        <SectionTitle>Finished today</SectionTitle>
        {finished.length ? (
          <ListCard>
            {finished.map((job, i) => (
              <React.Fragment key={job.id}>
                {i > 0 ? <RowSeparator /> : null}
                <JobRow
                  job={job}
                  onPress={
                    job.status === "completed"
                      ? () => router.push(`/templates/food-fleet/job/${job.id}`)
                      : undefined
                  }
                />
              </React.Fragment>
            ))}
          </ListCard>
        ) : (
          <ListCard>
            <View style={{ padding: 16 }}>
              <T variant="body" muted>
                No finished jobs yet — accept an offer from Home
              </T>
            </View>
          </ListCard>
        )}
      </View>
    </Screen>
  );
}
