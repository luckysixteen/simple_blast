from django.db import models


class BlastJob(models.Model):
    query = models.CharField(max_length=255, blank=True, null=True)
    # Status: pending, done
    status = models.CharField(max_length=10, blank=True, null=True)
    # created = models.DateTimeField(auto_now_add=True)


class BlastResult(models.Model):
    # query sequence
    blast_job = models.ForeignKey(BlastJob,
                                  blank=False,
                                  null=False,
                                  on_delete=models.CASCADE)
    result_no = models.IntegerField(blank=False, null=False)

    # start of alignment in subject
    sstart = models.IntegerField(blank=False, null=False)
    # end of alignment in subject
    send = models.IntegerField(blank=False, null=False)

    # Subject Strand
    sstrand = models.CharField(max_length=5)
    # expect value
    evalue = models.FloatField(blank=False, null=False)
    # percentage of identical matches
    pident = models.FloatField(blank=False, null=False)

    #  subject (e.g., reference genome) sequence
    sequence = models.CharField(max_length=255, blank=False, null=False)
